'use client';

import React, { createContext, useContext, useState } from 'react';
import { message } from 'antd';

type MessageType = 'success' | 'error' | 'info' | 'warning' | 'loading';

interface MessageContextProps {
   showMessage: (type: MessageType, content: string) => void;
}

const MessageContext = createContext<MessageContextProps | undefined>(undefined);

export const MessageProvider = ({ children }: { children: React.ReactNode }) => {
   const [messageApi, contextHolder] = message.useMessage();

   const showMessage = (type: MessageType, content: string) => {
      messageApi[type](content);
   };

   return (
      <MessageContext.Provider value={{ showMessage }}>
         {contextHolder}
         {children}
      </MessageContext.Provider>
   );
};

export const useMessageContext = () => {
   const context = useContext(MessageContext);
   if (!context) {
      throw new Error('useMessageContext must be used within a MessageProvider');
   }
   return context;
};
