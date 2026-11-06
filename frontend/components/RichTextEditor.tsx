'use client';

import React, { useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Table as TableIcon,
  Sparkles,
  Minus,
  RotateCcw,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Nhập mô tả chi tiết, thông số kỹ thuật, đánh giá ngoại hình...',
  minHeight = '220px',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  
  // Track last HTML emitted by the editor to prevent cursor-jumping feedback loops
  const lastEmittedHtmlRef = useRef<string>(value || '');

  // Initialize or synchronize when value changes externally (e.g. form reset, edit mode)
  useEffect(() => {
    if (value !== lastEmittedHtmlRef.current) {
      lastEmittedHtmlRef.current = value || '';
      if (editorRef.current) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  // Set initial content on mount
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value || '';
      lastEmittedHtmlRef.current = value || '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      const currentHtml = editorRef.current.innerHTML;
      lastEmittedHtmlRef.current = currentHtml;
      onChange(currentHtml);
    }
  };

  const executeCommand = (command: string, arg: string | undefined = undefined) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, arg);
      handleInput();
    }
  };

  // Insert ready-made 2-column specifications table
  const insertSpecTable = () => {
    const tableHtml = `
      <table style="width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 13px;">
        <thead>
          <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
            <th style="padding: 8px 12px; text-align: left; font-weight: bold; width: 35%;">Thông số</th>
            <th style="padding: 8px 12px; text-align: left; font-weight: bold;">Chi tiết</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 12px; font-weight: 600; color: #475569;">Cảm biến (Sensor)</td>
            <td style="padding: 8px 12px;">APS-C 24.3 Megapixels sạch đẹp</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 12px; font-weight: 600; color: #475569;">Số shot đã chụp</td>
            <td style="padding: 8px 12px;">~5.000 shot (còn rất mới)</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 12px; font-weight: 600; color: #475569;">Ống kính kèm</td>
            <td style="padding: 8px 12px;">Lens Kit 16-50mm OSS kính đẹp không mốc rễ</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 12px; font-weight: 600; color: #475569;">Màn hình LCD</td>
            <td style="padding: 8px 12px;">Lật 180 độ, sáng đẹp không ố ám</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 12px; font-weight: 600; color: #475569;">Kết nối</td>
            <td style="padding: 8px 12px;">Wifi chuyển ảnh trực tiếp sang điện thoại</td>
          </tr>
        </tbody>
      </table>
      <p><br></p>
    `;
    if (editorRef.current) {
      editorRef.current.focus();
      const success = document.execCommand('insertHTML', false, tableHtml);
      if (!success) {
        editorRef.current.innerHTML += tableHtml;
      }
      handleInput();
    }
  };

  // Insert Callout / Highlight box
  const insertCalloutBox = () => {
    const boxHtml = `
      <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 0 12px 12px 0; margin: 12px 0; font-size: 13px; color: #92400e;">
        <strong>⭐ Cam kết tại MÁY ẢNH TOP 1:</strong> Máy nguyên zin 100%, bảo hành phần cứng 06 tháng, 1 đổi 1 trong 7 ngày đầu nếu phát sinh lỗi kỹ thuật!
      </div>
      <p><br></p>
    `;
    if (editorRef.current) {
      editorRef.current.focus();
      const success = document.execCommand('insertHTML', false, boxHtml);
      if (!success) {
        editorRef.current.innerHTML += boxHtml;
      }
      handleInput();
    }
  };

  // Check if content is truly empty (ignoring empty tags like <p><br></p>)
  const isContentEmpty = (html: string) => {
    if (!html) return true;
    const stripped = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    return stripped.length === 0;
  };

  const showPlaceholder = isContentEmpty(lastEmittedHtmlRef.current);

  return (
    <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-xs focus-within:ring-2 focus-within:ring-amber-500/30 focus-within:border-amber-500 transition-all">
      {/* Editor Toolbar (Word-style) */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-200 text-slate-700 select-none">
        {/* Headings */}
        <button
          type="button"
          onClick={() => executeCommand('formatBlock', '<h2>')}
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors"
          title="Tiêu đề lớn (H2)"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('formatBlock', '<h3>')}
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors"
          title="Tiêu đề phụ (H3)"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-slate-300 mx-1 shrink-0" />

        {/* Basic text formatting */}
        <button
          type="button"
          onClick={() => executeCommand('bold')}
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-bold transition-colors"
          title="In đậm (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('italic')}
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 hover:text-slate-900 italic transition-colors"
          title="In nghiêng (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('underline')}
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 hover:text-slate-900 underline transition-colors"
          title="Gạch chân (Ctrl+U)"
        >
          <Underline className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('strikeThrough')}
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors"
          title="Gạch ngang"
        >
          <Strikethrough className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-slate-300 mx-1 shrink-0" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => executeCommand('insertUnorderedList')}
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors"
          title="Danh sách dấu chấm (Bullet)"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('insertOrderedList')}
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors"
          title="Danh sách số 1, 2, 3"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('insertHorizontalRule')}
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors"
          title="Kẻ đường phân cách"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-slate-300 mx-1 shrink-0" />

        {/* Custom templates */}
        <button
          type="button"
          onClick={insertSpecTable}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-amber-50 hover:border-amber-300 text-slate-700 hover:text-amber-700 text-xs font-semibold shadow-2xs transition-colors"
          title="Chèn mẫu bảng thông số kỹ thuật"
        >
          <TableIcon className="w-3.5 h-3.5 text-blue-600" />
          <span>+ Bảng thông số</span>
        </button>
        <button
          type="button"
          onClick={insertCalloutBox}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-amber-50 hover:border-amber-300 text-slate-700 hover:text-amber-700 text-xs font-semibold shadow-2xs transition-colors"
          title="Chèn khung cam kết nổi bật"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>+ Khung cam kết</span>
        </button>

        {/* Clear formatting */}
        <button
          type="button"
          onClick={() => executeCommand('removeFormat')}
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors ml-auto"
          title="Xóa định dạng"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Body Area */}
      <div className="relative">
        {showPlaceholder && (
          <div
            onClick={() => editorRef.current?.focus()}
            className="absolute top-4 left-4 text-sm text-slate-400 pointer-events-none select-none z-10"
          >
            {placeholder}
          </div>
        )}

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onBlur={handleInput}
          className="p-4 focus:outline-none text-sm text-slate-900 leading-relaxed overflow-y-auto prose prose-slate max-w-none"
          style={{ minHeight }}
        />
      </div>
    </div>
  );
}
