import { BaseListChatMessageHistory } from "@langchain/core/chat_history"
import { BaseChatModel } from "@langchain/core/language_models/chat_models"
import { StringOutputParser } from "@langchain/core/output_parsers"
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts"
import {
  Runnable,
  RunnablePassthrough,
  RunnableSequence,
  RunnableWithMessageHistory
} from "@langchain/core/runnables"
import { VectorStoreRetriever } from "@langchain/core/vectorstores"
import { formatDocumentsAsString } from "langchain/util/document"

export function getRunnableFromProperties(
  prompt: string,
  model: BaseChatModel,
  pastRunnable?: Runnable
): RunnableSequence {
  const promptTemplate = ChatPromptTemplate.fromMessages([
    ["system", prompt],
    new MessagesPlaceholder("chat_history"),
    ["human", "{question}"],
  ])

  const runnableSequence = pastRunnable
    ? RunnableSequence.from([pastRunnable, promptTemplate, model, new StringOutputParser()])
    : RunnableSequence.from([promptTemplate, model, new StringOutputParser()]);

  return runnableSequence;
}

export function assignRetrieverToRunnable(
  chain: RunnableSequence,
  retriever: VectorStoreRetriever
): RunnablePassthrough<any> {
  return RunnablePassthrough.assign({
    context: chain.pipe(retriever).pipe(formatDocumentsAsString)
  })
}

export function getRunnableWithMessageHistory(
  chain: any,
  chatHistory: BaseListChatMessageHistory
): RunnableWithMessageHistory<any, any> {
  return new RunnableWithMessageHistory({
    runnable: chain,
    getMessageHistory: () => chatHistory,
    inputMessagesKey: "question",
    historyMessagesKey: "chat_history"
  })
}