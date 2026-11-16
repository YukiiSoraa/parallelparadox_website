import React, { useEffect, useRef, useState } from 'react';
import { Check, Link2, RotateCcw, Upload, X } from 'lucide-react';

interface InlineEditableTextProps {
  value: string;
  onSave: (next: string) => void;
  editEnabled: boolean;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'div';
  multiline?: boolean;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
}

export function InlineEditableText({
  value,
  onSave,
  editEnabled,
  as: Tag = 'span',
  multiline = false,
  className = '',
  style,
  placeholder = 'Click to type...',
}: InlineEditableTextProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const initialValueRef = useRef(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!editing) {
      setDraft(value);
    }
  }, [value, editing]);

  useEffect(() => {
    if (editing) {
      const el = multiline ? textareaRef.current : inputRef.current;
      if (el) {
        el.focus();
        el.select();
      }
    }
  }, [editing, multiline]);

  if (!editEnabled) {
    return (
      <Tag className={className} style={style}>
        {value}
      </Tag>
    );
  }

  const startEditing = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    initialValueRef.current = value;
    setDraft(value);
    setEditing(true);
  };

  const commit = (nextVal: string) => {
    const cleaned = nextVal.trim() ? nextVal : initialValueRef.current;
    onSave(cleaned);
    setEditing(false);
  };

  const cancel = () => {
    onSave(initialValueRef.current);
    setDraft(initialValueRef.current);
    setEditing(false);
  };

  const handleChange = (nextVal: string) => {
    setDraft(nextVal);
    if (nextVal.trim()) {
      onSave(nextVal);
    }
  };

  if (editing) {
    const cleanClasses = className
      .replace(/\btext-y3k-ice\b/g, 'text-[#E0F2FE]')
      .replace(/\bline-clamp-\d+\b/g, '');

    if (multiline) {
      return (
        <textarea
          ref={textareaRef}
          rows={3}
          value={draft}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={() => commit(draft)}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              cancel();
            }
          }}
          placeholder={placeholder}
          style={style}
          className={`${cleanClasses} w-full bg-[#060E24]/95 text-[#E0F2FE] border border-dashed border-[#7DD3FC] rounded-md px-2 py-1 focus:outline-none`}
        />
      );
    }

    return (
      <input
        ref={inputRef}
        type="text"
        value={draft}
        size={Math.max(draft.length + 1, 6)}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={() => commit(draft)}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit(draft);
          } else if (e.key === 'Escape') {
            e.preventDefault();
            cancel();
          }
        }}
        placeholder={placeholder}
        style={style}
        className={`${cleanClasses} max-w-full bg-[#060E24]/95 text-[#E0F2FE] border border-dashed border-[#7DD3FC] rounded-md px-2 py-0.5 focus:outline-none`}
      />
    );
  }

  return (
    <Tag
      onClick={startEditing}
      title="Click to edit text"
      style={style}
      className={`${className} outline-1 outline-dashed outline-[#7DD3FC]/55 hover:outline-[#BAE6FD] rounded-sm cursor-text transition-[outline-color]`}
    >
      {value || placeholder}
    </Tag>
  );
}

export interface ImageSwapTarget {
  label: string;
  currentUrl: string;
  defaultUrl: string;
  showPresets?: boolean;
  onApply: (nextUrl: string) => void;
}

function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxW = 720;
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(reader.result));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.84));
      };
      img.onerror = reject;
      img.src = String(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ImageSwapModal({
  target,
  onClose,
}: {
  target: ImageSwapTarget;
  onClose: () => void;
}) {
  const [urlInput, setUrlInput] = useState(target.currentUrl);
  const [error, setError] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    try {
      const dataUrl = await compressImageFile(file);
      setUrlInput(dataUrl);
      target.onApply(dataUrl);
      onClose();
    } catch {
      setError('Could not load that image file. Try a JPG, PNG, or WebP.');
    }
  };

  const handleSubmitUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = urlInput.trim();
    if (!cleaned) {
      setError('Paste an image URL or upload a photo.');
      return;
    }
    target.onApply(cleaned);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#040917]/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md y2k-navy-card border border-[#93C5FD]/40 rounded-2xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#93C5FD]/20">
          <div>
            <div className="font-mono text-[10px] tracking-[0.14em] text-[#7DD3FC]">
              CLICK-TO-SWAP IMAGE
            </div>
            <h3 className="font-display text-lg font-extrabold text-white mt-0.5">
              {target.label}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close image swapper"
            className="w-8 h-8 inline-flex items-center justify-center border border-[#93C5FD]/30 bg-[#060E24] hover:bg-[#172F6B] text-[#CBD5E1] hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4 font-mono text-xs">
          <div className="flex items-center gap-4">
            <img
              src={urlInput || target.defaultUrl}
              alt="Preview"
              className="w-16 h-20 object-cover object-top rounded-xl border border-[#93C5FD]/40 shrink-0 bg-[#060E24]"
            />
            <div className="flex-1 space-y-2">
              <label className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 y3k-aero-btn text-[#060E24] font-bold rounded-xl cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>UPLOAD FROM COMPUTER</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  target.onApply(target.defaultUrl);
                  onClose();
                }}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#060E24] hover:bg-[#172F6B] text-[#CBD5E1] border border-[#93C5FD]/25 rounded-xl cursor-pointer text-[11px]"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restore Default Image</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmitUrl} className="space-y-2.5">
            <label className="block text-[11px] text-[#94A3B8]">
              OR PASTE IMAGE LINK (URL)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link2 className="w-3.5 h-3.5 text-[#93C5FD] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full bg-[#060E24] border border-[#93C5FD]/30 focus:border-[#60A5FA] focus:outline-none pl-8 pr-3 py-2 text-white rounded-xl"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-1 px-4 py-2 bg-[#0F214D] hover:bg-[#172F6B] text-[#E0F2FE] border border-[#93C5FD]/40 rounded-xl font-semibold cursor-pointer shrink-0"
              >
                <Check className="w-3.5 h-3.5" />
                <span>APPLY</span>
              </button>
            </div>
          </form>

          {error && <p className="text-amber-300 text-[11px]">{error}</p>}
        </div>
      </div>
    </div>
  );
}
