"use client"

import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin"
import { ListPlugin } from "@lexical/react/LexicalListPlugin"
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin"
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin"
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin"
import { TRANSFORMERS } from "@lexical/markdown"

import { ContentEditable } from "@/components/editor/editor-ui/content-editable"

import { ToolbarPlugin } from "@/components/editor/plugins/toolbar/toolbar-plugin"
import { BlockFormatDropDown } from "@/components/editor/plugins/toolbar/block-format-toolbar-plugin"
import { FormatParagraph } from "@/components/editor/plugins/toolbar/block-format/format-paragraph"
import { FormatHeading } from "@/components/editor/plugins/toolbar/block-format/format-heading"
import { FormatNumberedList } from "@/components/editor/plugins/toolbar/block-format/format-numbered-list"
import { FormatBulletedList } from "@/components/editor/plugins/toolbar/block-format/format-bulleted-list"
import { FormatCheckList } from "@/components/editor/plugins/toolbar/block-format/format-check-list"
import { FormatQuote } from "@/components/editor/plugins/toolbar/block-format/format-quote"

export function Plugins() {
  return (
    <div className="relative">
      {/* Toolbar */}
      <ToolbarPlugin>
        {() => (
          <div className="sticky top-0 z-10 flex gap-2 overflow-auto border-b bg-background/95 p-1 backdrop-blur">
            <BlockFormatDropDown>
              <FormatParagraph />
              <FormatHeading levels={["h1", "h2", "h3"]} />
              <FormatNumberedList />
              <FormatBulletedList />
              <FormatCheckList />
              <FormatQuote />
            </BlockFormatDropDown>
          </div>
        )}
      </ToolbarPlugin>

      {/* Editor */}
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            placeholder="Start typing..."
            className="relative block min-h-[200px] overflow-auto px-6 py-4 focus:outline-none"
          />
        }
        ErrorBoundary={LexicalErrorBoundary}
      />

      {/* Core plugins */}
      <HistoryPlugin />
      <AutoFocusPlugin />
      <ListPlugin />
      <CheckListPlugin />
      <LinkPlugin />
      <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
    </div>
  )
}
