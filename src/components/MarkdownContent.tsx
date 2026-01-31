import { useEffect, useRef, useId } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

// Basic syntax highlighting patterns
const highlightCode = (code: string, language: string): string => {
  let highlighted = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Language-specific highlighting
  const isJsLike = ["js", "javascript", "jsx", "ts", "typescript", "tsx"].includes(language);
  const isCssLike = ["css", "scss", "sass", "less"].includes(language);
  const isHtmlLike = ["html", "xml", "svg"].includes(language);
  const isPython = ["python", "py"].includes(language);
  const isSql = ["sql"].includes(language);
  const isJson = ["json"].includes(language);

  // Comments (must be first to avoid conflicts)
  if (isJsLike || isCssLike) {
    highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span class="code-comment">$1</span>');
    highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="code-comment">$1</span>');
  }
  if (isPython) {
    highlighted = highlighted.replace(/(#.*$)/gm, '<span class="code-comment">$1</span>');
  }
  if (isSql) {
    highlighted = highlighted.replace(/(--.*$)/gm, '<span class="code-comment">$1</span>');
  }
  if (isHtmlLike) {
    highlighted = highlighted.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="code-comment">$1</span>');
  }

  // Strings
  highlighted = highlighted.replace(/("(?:[^"\\]|\\.)*")/g, '<span class="code-string">$1</span>');
  highlighted = highlighted.replace(/('(?:[^'\\]|\\.)*')/g, '<span class="code-string">$1</span>');
  if (isJsLike) {
    highlighted = highlighted.replace(/(`(?:[^`\\]|\\.)*`)/g, '<span class="code-string">$1</span>');
  }

  // Numbers
  highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, '<span class="code-number">$1</span>');

  // Keywords
  if (isJsLike) {
    const keywords = /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|new|class|extends|import|export|from|default|async|await|yield|typeof|instanceof|in|of|this|super|null|undefined|true|false|void)\b/g;
    highlighted = highlighted.replace(keywords, '<span class="code-keyword">$1</span>');
    const builtins = /\b(console|window|document|Array|Object|String|Number|Boolean|Promise|Map|Set|JSON|Math|Date|Error|RegExp|fetch|setTimeout|setInterval)\b/g;
    highlighted = highlighted.replace(builtins, '<span class="code-builtin">$1</span>');
  }
  
  if (isPython) {
    const keywords = /\b(def|class|if|elif|else|for|while|try|except|finally|with|as|import|from|return|yield|lambda|pass|break|continue|raise|assert|global|nonlocal|True|False|None|and|or|not|in|is)\b/g;
    highlighted = highlighted.replace(keywords, '<span class="code-keyword">$1</span>');
    const builtins = /\b(print|len|range|str|int|float|list|dict|set|tuple|type|isinstance|open|input|sum|min|max|abs|round|sorted|enumerate|zip|map|filter)\b/g;
    highlighted = highlighted.replace(builtins, '<span class="code-builtin">$1</span>');
  }

  if (isSql) {
    const keywords = /\b(SELECT|FROM|WHERE|AND|OR|NOT|IN|LIKE|BETWEEN|JOIN|LEFT|RIGHT|INNER|OUTER|ON|GROUP|BY|ORDER|ASC|DESC|LIMIT|OFFSET|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|DROP|ALTER|ADD|INDEX|PRIMARY|KEY|FOREIGN|REFERENCES|NULL|UNIQUE|DEFAULT|CHECK|CONSTRAINT|AS|DISTINCT|COUNT|SUM|AVG|MIN|MAX|HAVING|UNION|ALL|EXISTS|CASE|WHEN|THEN|ELSE|END)\b/gi;
    highlighted = highlighted.replace(keywords, (match) => `<span class="code-keyword">${match}</span>`);
  }

  if (isCssLike) {
    highlighted = highlighted.replace(/([a-z-]+)(\s*:)/gi, '<span class="code-property">$1</span>$2');
    highlighted = highlighted.replace(/:\s*([^;{}"']+)/g, (match, value) => {
      return `: <span class="code-value">${value}</span>`;
    });
    highlighted = highlighted.replace(/^([.#]?[a-zA-Z_-][\w-]*)/gm, '<span class="code-selector">$1</span>');
  }

  if (isHtmlLike) {
    highlighted = highlighted.replace(/(&lt;\/?)([\w-]+)/g, '$1<span class="code-tag">$2</span>');
    highlighted = highlighted.replace(/\s([\w-]+)(=)/g, ' <span class="code-attribute">$1</span>$2');
  }

  if (isJson) {
    highlighted = highlighted.replace(/"([^"]+)"(\s*:)/g, '<span class="code-property">"$1"</span>$2');
  }

  // Function calls
  highlighted = highlighted.replace(/\b([a-zA-Z_][\w]*)\s*\(/g, '<span class="code-function">$1</span>(');

  return highlighted;
};

// SVG icons as strings for the copy button
const copyIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
const checkIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const uniqueId = useId().replace(/:/g, "");

  const parseMarkdown = (text: string): string => {
    let html = text;
    const codeBlocks: { code: string; html: string }[] = [];
    
    // Handle fenced code blocks (```)
    html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
      const language = lang || "text";
      const trimmedCode = code.trim();
      const highlightedCode = highlightCode(trimmedCode, language);
      const blockIndex = codeBlocks.length;
      const placeholder = `__CODE_BLOCK_${blockIndex}__`;
      
      codeBlocks.push({
        code: trimmedCode,
        html: `
          <div class="code-block-wrapper my-4 rounded-lg overflow-hidden border border-border/50">
            <div class="code-header flex items-center justify-between px-4 py-2 bg-muted/80 border-b border-border/50">
              <span class="text-xs font-mono text-muted-foreground">${language}</span>
              <button 
                type="button"
                class="copy-code-btn flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                data-code-id="${uniqueId}-${blockIndex}"
                aria-label="Copy code"
              >
                <span class="copy-icon">${copyIcon}</span>
                <span class="copy-text">Copy</span>
              </button>
            </div>
            <pre class="code-block p-4 overflow-x-auto bg-[hsl(var(--code-bg))] text-sm"><code class="font-mono leading-relaxed">${highlightedCode}</code></pre>
            <textarea class="hidden-code-source" data-code-id="${uniqueId}-${blockIndex}" style="display:none;" readonly>${trimmedCode.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</textarea>
          </div>
        `,
      });
      return placeholder;
    });

    // Escape HTML for remaining content
    html = html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Headers
    html = html.replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold mt-5 mb-2">$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-6 mb-3">$1</h1>');

    // Bold and italic
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>');
    html = html.replace(/__(.+?)__/g, '<strong class="font-semibold">$1</strong>');
    html = html.replace(/_(.+?)_/g, '<em class="italic">$1</em>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-muted text-sm font-mono text-primary">$1</code>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');

    // Ordered lists
    html = html.replace(/^(\d+)\. (.+)$/gm, '<li class="ml-6 list-decimal">$2</li>');

    // Unordered lists
    html = html.replace(/^[-*] (.+)$/gm, '<li class="ml-6 list-disc">$2</li>');

    // Wrap consecutive list items
    html = html.replace(/(<li class="ml-6 list-decimal">.*<\/li>\n?)+/g, (match) => {
      return `<ol class="my-2 space-y-1">${match}</ol>`;
    });
    html = html.replace(/(<li class="ml-6 list-disc">.*<\/li>\n?)+/g, (match) => {
      return `<ul class="my-2 space-y-1">${match}</ul>`;
    });

    // Blockquotes
    html = html.replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-primary/30 pl-4 italic text-muted-foreground my-2">$1</blockquote>');

    // Horizontal rules
    html = html.replace(/^---$/gm, '<hr class="my-4 border-border" />');

    // Restore code blocks
    codeBlocks.forEach((block, index) => {
      html = html.replace(`__CODE_BLOCK_${index}__`, block.html);
    });

    // Line breaks
    html = html.replace(/\n\n/g, '</p><p class="my-2">');

    // Wrap in paragraph if not already wrapped
    if (!html.startsWith('<') && !html.startsWith('__CODE')) {
      html = `<p class="my-2">${html}</p>`;
    }

    return html;
  };

  // Attach copy handlers after render
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleCopyClick = async (e: Event) => {
      const button = (e.target as Element).closest('.copy-code-btn') as HTMLButtonElement;
      if (!button) return;

      const codeId = button.getAttribute('data-code-id');
      if (!codeId) return;

      const textarea = container.querySelector(`textarea[data-code-id="${codeId}"]`) as HTMLTextAreaElement;
      if (!textarea) return;

      const code = textarea.value;

      try {
        await navigator.clipboard.writeText(code);
        
        // Update button UI
        const copyIconEl = button.querySelector('.copy-icon');
        const copyTextEl = button.querySelector('.copy-text');
        
        if (copyIconEl && copyTextEl) {
          copyIconEl.innerHTML = checkIcon;
          copyTextEl.textContent = 'Copied!';
          button.classList.add('text-success');
          
          setTimeout(() => {
            copyIconEl.innerHTML = copyIcon;
            copyTextEl.textContent = 'Copy';
            button.classList.remove('text-success');
          }, 2000);
        }

        toast.success("Đã sao chép code!");
      } catch (err) {
        toast.error("Không thể sao chép");
      }
    };

    container.addEventListener('click', handleCopyClick);
    return () => container.removeEventListener('click', handleCopyClick);
  }, [content]);

  return (
    <div
      ref={containerRef}
      className={cn("markdown-content prose-custom text-sm leading-relaxed", className)}
      dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
    />
  );
}
