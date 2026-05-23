import React from 'react';

interface MarkdownViewerProps {
  content: string;
}

export function MarkdownViewer({ content }: MarkdownViewerProps) {
  if (!content) return null;

  // Split lines
  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];

  let inList = false;
  let listItems: React.ReactNode[] = [];

  const flushList = (key: number) => {
    if (listItems.length > 0) {
      renderedElements.push(
        <ul key={`ul-${key}`} className="list-disc pl-6 mb-4 space-y-2 text-slate-700 dark:text-slate-300">
          {...listItems}
        </ul>
      );
      listItems = [];
    }
    inList = false;
  };

  const escapeHtml = (str: string): string => {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  // Process text to format bold items
  const formatText = (text: string) => {
    // Escape HTML first to prevent XSS, then parse markdown bold
    const escapedText = escapeHtml(text);

    // Parse bold text **text**
    const parts = escapedText.split(/\*\*([\s\S]*?)\*\*/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <strong key={index} className="font-semibold text-rose-700 bg-rose-50 px-1 rounded border border-rose-100/50">
            {part}
          </strong>
        );
      }
      return part;
    });
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    // Headers - ### or ####
    if (trimmedLine.startsWith('###') || trimmedLine.startsWith('####')) {
      flushList(index);
      const headerText = trimmedLine.replace(/^#+\s+/, '');
      renderedElements.push(
        <h4 key={index} className="text-xl font-bold text-slate-900 mt-6 mb-3 flex items-center gap-2 border-b border-rose-100 pb-1 font-display">
          {formatText(headerText)}
        </h4>
      );
    }
    // Headers - ##
    else if (trimmedLine.startsWith('##')) {
      flushList(index);
      const headerText = trimmedLine.replace(/^##\s+/, '');
      renderedElements.push(
        <h3 key={index} className="text-2xl font-bold text-rose-800 mt-8 mb-4 border-l-4 border-rose-500 pl-3 font-display">
          {formatText(headerText)}
        </h3>
      );
    }
    // Headers - #
    else if (trimmedLine.startsWith('#')) {
      flushList(index);
      const headerText = trimmedLine.replace(/^#\s+/, '');
      renderedElements.push(
        <h2 key={index} className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-violet-600 mt-8 mb-4 font-display">
          {formatText(headerText)}
        </h2>
      );
    }
    // List Items - Starts with - or *
    else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      inList = true;
      const itemText = trimmedLine.substring(2);
      listItems.push(
        <li key={`li-${index}`} className="leading-relaxed hover:text-slate-900 transition-colors">
          {formatText(itemText)}
        </li>
      );
    }
    // Code blocks/Blockquotes
    else if (trimmedLine.startsWith('>')) {
      flushList(index);
      const quoteText = trimmedLine.substring(1).trim();
      renderedElements.push(
        <blockquote key={index} className="border-l-4 border-violet-400 bg-violet-50/50 p-4 rounded-r-lg my-4 italic text-slate-800">
          {formatText(quoteText)}
        </blockquote>
      );
    }
    // Blank lines
    else if (trimmedLine === '') {
      flushList(index);
    }
    // Regular paragraphs
    else {
      flushList(index);
      renderedElements.push(
        <p key={index} className="text-slate-700 leading-relaxed mb-4 text-justify">
          {formatText(trimmedLine)}
        </p>
      );
    }
  });

  // Flush any lingering list
  flushList(lines.length);

  return <div className="space-y-1">{renderedElements}</div>;
}
