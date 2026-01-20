import { HeadingNode, QuoteNode } from "@lexical/rich-text"
import { ListItemNode, ListNode } from "@lexical/list"
import { LinkNode, AutoLinkNode } from "@lexical/link"
import { CodeNode, CodeHighlightNode } from "@lexical/code"
import {
  ParagraphNode,
  TextNode,
  type Klass,
  type LexicalNode,
  type LexicalNodeReplacement,
} from "lexical"

export const nodes: ReadonlyArray<
  Klass<LexicalNode> | LexicalNodeReplacement
> = [
    HeadingNode,
    ParagraphNode,
    TextNode,
    QuoteNode,
    ListNode,
    ListItemNode,
    LinkNode,
    AutoLinkNode,
    CodeNode,
    CodeHighlightNode,
  ]
