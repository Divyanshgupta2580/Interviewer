'use client';

import { create } from 'zustand';
import type { ChatMessage, ChatAttachment } from '@/types';
import { loadFromStorage, saveToStorage } from '@/lib/storage';
import { fixtureChatMessages } from '@/lib/fixtures/chat-messages';

interface ChatState {
  messages: ChatMessage[];
  isHydrated: boolean;
  isSending: boolean;
  attachments: ChatAttachment[];

  hydrate: () => void;
  sendMessage: (content: string) => void;
  addAttachment: (file: File) => void;
  removeAttachment: (id: string) => void;
  clearAttachments: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isHydrated: false,
  isSending: false,
  attachments: [],

  hydrate: () => {
    const messages = loadFromStorage<ChatMessage[]>('chat-messages', fixtureChatMessages);
    set({ messages, isHydrated: true });
  },

  sendMessage: (content: string) => {
    if (!content.trim() && get().attachments.length === 0) return;

    const userMessage: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content,
      attachments: get().attachments.length > 0 ? [...get().attachments] : undefined,
      timestamp: new Date().toISOString(),
    };

    const messages = [...get().messages, userMessage];
    saveToStorage('chat-messages', messages);
    set({ messages, isSending: true, attachments: [] });

    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: 'msg-' + Date.now() + '-resp',
        role: 'assistant',
        content:
          'I have noted your message. In demo mode, I can confirm receipt of your input and any uploaded files, but I cannot provide live AI analysis. When the backend is connected, I will be able to help you prepare interview questions, analyse your resume, and give personalised feedback.',
        timestamp: new Date().toISOString(),
      };
      const updated = [...get().messages, assistantMessage];
      saveToStorage('chat-messages', updated);
      set({ messages: updated, isSending: false });
    }, 800);
  },

  addAttachment: (file: File) => {
    const attachment: ChatAttachment = {
      id: 'att-' + Date.now(),
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      status: 'uploaded',
      statusMessage: 'File uploaded. Text extraction and analysis are not yet available in demo mode.',
    };
    set({ attachments: [...get().attachments, attachment] });
  },

  removeAttachment: (id: string) => {
    set({ attachments: get().attachments.filter((a) => a.id !== id) });
  },

  clearAttachments: () => set({ attachments: [] }),
}));
