'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AboutPage() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 读取 markdown 文件
    fetch('/about.md')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load about.md');
        }
        return res.text();
      })
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 md:p-8">
      <div className="max-w-[85vw] mx-auto">
        {/* 返回按钮 */}
        <div className="mb-6 shrink-0">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-all border border-slate-700"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            返回主页
          </Link>
        </div>

        {/* 内容区域 */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-slate-700">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-6">
            关于本项目
          </h1>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-slate-400">加载中...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
              <p className="text-red-400">加载失败: {error}</p>
              <p className="text-slate-400 text-sm mt-2">请确保 about.md 文件存在于 public 目录中</p>
            </div>
          )}

          {!loading && !error && content && (
            <div className="prose prose-invert prose-slate max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // 自定义标题样式
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold text-white mb-4 mt-6 first:mt-0">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-semibold text-blue-300 mb-3 mt-5">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-medium text-purple-300 mb-2 mt-4">
                      {children}
                    </h3>
                  ),
                  // 自定义列表样式
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside space-y-2 my-4 text-slate-300">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside space-y-2 my-4 text-slate-300">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => <li className="ml-4">{children}</li>,
                  // 自定义代码块样式
                  code: ({ node, inline, className, children, ...props }: any) => {
                    if (inline) {
                      return (
                        <code className="bg-slate-700 px-1.5 py-0.5 rounded text-pink-300 font-mono text-sm" {...props}>
                          {children}
                        </code>
                      );
                    }
                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children }) => (
                    <pre className="bg-slate-900 rounded-lg p-4 overflow-x-auto my-4 border border-slate-700">
                      {children}
                    </pre>
                  ),
                  // 自定义链接样式
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      className="text-blue-400 hover:text-blue-300 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
                  // 自定义引用样式
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-slate-600 pl-4 py-2 my-4 text-slate-400 italic">
                      {children}
                    </blockquote>
                  ),
                  // 自定义分割线样式
                  hr: () => (
                    <hr className="border-slate-700 my-6" />
                  ),
                  // 自定义段落样式
                  p: ({ children }) => (
                    <p className="text-slate-300 my-3 leading-relaxed">
                      {children}
                    </p>
                  ),
                  // 自定义强调样式
                  strong: ({ children }) => (
                    <strong className="text-white font-semibold">
                      {children}
                    </strong>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
