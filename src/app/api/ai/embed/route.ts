import { initializeOpenAIEmbeddings } from '@/app/utils/model'
import { NextResponse } from 'next/server'
import { getDatabaseConnectionToCollection, closeDatabaseConnection } from '@/app/utils/database';
import { initializeMongoDBVectorStore } from '@/app/utils/vectorStore'
import { generateSplitDocumentsFromFile } from '@/app/utils/textSplitter';

export async function POST(request: Request) {
  const data = request.formData()

  const file: File | null = (await data).get('file') as unknown as File
  if (!file) {
    return NextResponse.json({ message: 'Missing file input', success: false })
  }

  const splitDocs = await generateSplitDocumentsFromFile(file)
  const embeddings = initializeOpenAIEmbeddings()
  const collection = await getDatabaseConnectionToCollection('embeddings');
  const vectorStore = initializeMongoDBVectorStore(embeddings, collection)
  await vectorStore.addDocuments(splitDocs)
  await closeDatabaseConnection();

  return new NextResponse(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
}
