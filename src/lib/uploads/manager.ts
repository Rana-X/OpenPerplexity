import path from 'path';
import BaseEmbedding from '../models/base/embedding';
import crypto from 'crypto';
import fs from 'fs';
import { splitText } from '../utils/splitText';
import { PDFParse } from 'pdf-parse';
import { CanvasFactory } from 'pdf-parse/worker';
import officeParser from 'officeparser';
import { getDemoUploadTtlMs } from '../demo';

const supportedMimeTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
] as const;

type SupportedMimeType = typeof supportedMimeTypes[number];

type UploadManagerParams = {
  embeddingModel: BaseEmbedding<any>;
  demoSessionId?: string | null;
};

type UploadLookupOptions = {
  demoSessionId?: string | null;
};

type StoragePaths = {
  uploadsDir: string;
  recordPath: string;
};

type RecordedFile = {
  id: string;
  name: string;
  filePath: string;
  contentPath: string;
  uploadedAt: string;
};

type FileRes = {
  fileName: string;
  fileExtension: string;
  fileId: string;
};

class UploadManager {
  private embeddingModel: BaseEmbedding<any>;
  private demoSessionId: string | null;
  private uploadsDir: string;

  static uploadsDir = path.join(process.cwd(), 'data', 'uploads');
  static demoUploadsDir = path.join(this.uploadsDir, 'demo');

  constructor(private params: UploadManagerParams) {
    this.embeddingModel = params.embeddingModel;
    this.demoSessionId = params.demoSessionId ?? null;

    const storagePaths = UploadManager.getStoragePaths(this.demoSessionId);
    this.uploadsDir = storagePaths.uploadsDir;

    UploadManager.ensureStorageExists(storagePaths);
  }

  private static getStoragePaths(
    demoSessionId: string | null = null,
  ): StoragePaths {
    if (demoSessionId) {
      const uploadsDir = path.join(this.demoUploadsDir, demoSessionId);
      return {
        uploadsDir,
        recordPath: path.join(uploadsDir, 'uploaded_files.json'),
      };
    }

    return {
      uploadsDir: this.uploadsDir,
      recordPath: path.join(this.uploadsDir, 'uploaded_files.json'),
    };
  }

  private static ensureStorageExists({ uploadsDir, recordPath }: StoragePaths) {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    if (!fs.existsSync(recordPath)) {
      fs.writeFileSync(recordPath, JSON.stringify({ files: [] }, null, 2));
    }
  }

  private static getRecordedFiles(
    demoSessionId: string | null = null,
  ): RecordedFile[] {
    const storagePaths = this.getStoragePaths(demoSessionId);
    this.ensureStorageExists(storagePaths);
    const data = fs.readFileSync(storagePaths.recordPath, 'utf-8');
    return JSON.parse(data).files;
  }

  private static addNewRecordedFile(
    fileRecord: RecordedFile,
    demoSessionId: string | null = null,
  ) {
    const storagePaths = this.getStoragePaths(demoSessionId);
    const currentData = this.getRecordedFiles(demoSessionId);

    currentData.push(fileRecord);

    fs.writeFileSync(
      storagePaths.recordPath,
      JSON.stringify({ files: currentData }, null, 2),
    );
  }

  static getFile(
    fileId: string,
    options: UploadLookupOptions = {},
  ): RecordedFile | null {
    const recordedFiles = this.getRecordedFiles(options.demoSessionId ?? null);

    return recordedFiles.find((file) => file.id === fileId) || null;
  }

  static getFileChunks(
    fileId: string,
    options: UploadLookupOptions = {},
  ): { content: string; embedding: number[] }[] {
    try {
      const recordedFile = this.getFile(fileId, options);

      if (!recordedFile) {
        throw new Error(`File with ID ${fileId} not found`);
      }

      const contentData = JSON.parse(
        fs.readFileSync(recordedFile.contentPath, 'utf-8'),
      );

      return contentData.chunks;
    } catch (err) {
      console.log('Error getting file chunks:', err);
      return [];
    }
  }

  static cleanupExpiredDemoSessions(ttlMs = getDemoUploadTtlMs()) {
    if (!fs.existsSync(this.demoUploadsDir)) {
      return;
    }

    const now = Date.now();

    fs.readdirSync(this.demoUploadsDir, { withFileTypes: true }).forEach(
      (entry) => {
        if (!entry.isDirectory()) {
          return;
        }

        const sessionDir = path.join(this.demoUploadsDir, entry.name);
        const recordPath = path.join(sessionDir, 'uploaded_files.json');

        let lastTouched = 0;

        try {
          if (fs.existsSync(recordPath)) {
            const records = JSON.parse(fs.readFileSync(recordPath, 'utf-8'))
              .files as RecordedFile[];

            lastTouched = records.reduce((latest, record) => {
              const uploadedAt = new Date(record.uploadedAt).getTime();
              return Number.isFinite(uploadedAt)
                ? Math.max(latest, uploadedAt)
                : latest;
            }, 0);
          }

          if (lastTouched === 0) {
            lastTouched = fs.statSync(sessionDir).mtimeMs;
          }

          if (now - lastTouched > ttlMs) {
            fs.rmSync(sessionDir, { recursive: true, force: true });
          }
        } catch (err) {
          console.error('Error cleaning up demo uploads:', err);
        }
      },
    );
  }

  private async extractContentAndEmbed(
    filePath: string,
    fileType: SupportedMimeType,
  ): Promise<string> {
    switch (fileType) {
      case 'text/plain': {
        const content = fs.readFileSync(filePath, 'utf-8');
        const splittedText = splitText(content, 512, 128);
        const embeddings = await this.embeddingModel.embedText(splittedText);

        if (embeddings.length !== splittedText.length) {
          throw new Error('Embeddings and text chunks length mismatch');
        }

        const contentPath =
          filePath.split('.').slice(0, -1).join('.') + '.content.json';

        fs.writeFileSync(
          contentPath,
          JSON.stringify(
            {
              chunks: splittedText.map((text, i) => ({
                content: text,
                embedding: embeddings[i],
              })),
            },
            null,
            2,
          ),
        );

        return contentPath;
      }
      case 'application/pdf': {
        const pdfBuffer = fs.readFileSync(filePath);

        const parser = new PDFParse({
          data: pdfBuffer,
          CanvasFactory,
        });

        const pdfText = await parser.getText().then((res) => res.text);
        const pdfSplittedText = splitText(pdfText, 512, 128);
        const pdfEmbeddings = await this.embeddingModel.embedText(
          pdfSplittedText,
        );

        if (pdfEmbeddings.length !== pdfSplittedText.length) {
          throw new Error('Embeddings and text chunks length mismatch');
        }

        const pdfContentPath =
          filePath.split('.').slice(0, -1).join('.') + '.content.json';

        fs.writeFileSync(
          pdfContentPath,
          JSON.stringify(
            {
              chunks: pdfSplittedText.map((text, i) => ({
                content: text,
                embedding: pdfEmbeddings[i],
              })),
            },
            null,
            2,
          ),
        );

        return pdfContentPath;
      }
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
        const docBuffer = fs.readFileSync(filePath);
        const docText = await officeParser.parseOfficeAsync(docBuffer);
        const docSplittedText = splitText(docText, 512, 128);
        const docEmbeddings = await this.embeddingModel.embedText(
          docSplittedText,
        );

        if (docEmbeddings.length !== docSplittedText.length) {
          throw new Error('Embeddings and text chunks length mismatch');
        }

        const docContentPath =
          filePath.split('.').slice(0, -1).join('.') + '.content.json';

        fs.writeFileSync(
          docContentPath,
          JSON.stringify(
            {
              chunks: docSplittedText.map((text, i) => ({
                content: text,
                embedding: docEmbeddings[i],
              })),
            },
            null,
            2,
          ),
        );

        return docContentPath;
      }
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  }

  async processFiles(files: File[]): Promise<FileRes[]> {
    const processedFiles: FileRes[] = [];

    await Promise.all(
      files.map(async (file) => {
        if (!(supportedMimeTypes as unknown as string[]).includes(file.type)) {
          throw new Error(`File type ${file.type} not supported`);
        }

        const fileId = crypto.randomBytes(16).toString('hex');
        const fileExtension = file.name.split('.').pop();
        const fileName = `${crypto.randomBytes(16).toString('hex')}.${fileExtension}`;
        const filePath = path.join(this.uploadsDir, fileName);
        const buffer = Buffer.from(await file.arrayBuffer());

        fs.writeFileSync(filePath, buffer);

        const contentFilePath = await this.extractContentAndEmbed(
          filePath,
          file.type as SupportedMimeType,
        );

        UploadManager.addNewRecordedFile(
          {
            id: fileId,
            name: file.name,
            filePath,
            contentPath: contentFilePath,
            uploadedAt: new Date().toISOString(),
          },
          this.demoSessionId,
        );

        processedFiles.push({
          fileExtension: fileExtension || '',
          fileId,
          fileName: file.name,
        });
      }),
    );

    return processedFiles;
  }
}

export default UploadManager;
