import React, { useState, useRef, useEffect } from 'react';
import { Send, Copy, RefreshCw, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface BibleChatbotProps {
  onClose: () => void;
  onInteraction: () => void;
}

const defaultResponses = {
  grace: [
    "La grazia di Dio è il Suo amore gratuito verso di noi. 'Poiché è per grazia che siete stati salvati, mediante la fede' (Efesini 2:8).",
    "La grazia è il favore immeritato di Dio. 'Ma Dio, che è ricco in misericordia, ci ha amati' (Efesini 2:4-5)."
  ],
  mercy: [
    "La misericordia di Dio è la Sua compassione verso chi soffre. 'Il Signore è misericordioso e pietoso' (Salmo 103:8).",
    "Dio è ricco in misericordia. 'Le sue misericordie non sono esaurite' (Lamentazioni 3:22)."
  ],
  love: [
    "L'amore di Dio è perfetto e incondizionato. 'Dio è amore' (1 Giovanni 4:8).",
    "L'amore del Signore dura in eterno. 'Perché Dio ha tanto amato il mondo' (Giovanni 3:16)."
  ],
  faith: [
    "La fede è fondamento della vita cristiana. 'La fede è certezza di cose che si sperano' (Ebrei 11:1).",
    "Senza fede è impossibile piacere a Dio. 'Il giusto vivrà per fede' (Romani 1:17)."
  ],
  hope: [
    "La speranza cristiana è ancorata in Cristo. 'Cristo in voi, speranza della gloria' (Colossesi 1:27).",
    "La speranza non delude. 'Beato colui che spera nel Signore' (Salmo 40:4)."
  ],
  default: [
    "Interessante domanda! La Bibbia è piena di saggezza. Prova a chiedere qualcosa su grazia, amore, fede, speranza o misericordia.",
    "La Parola di Dio è luce sul nostro cammino. 'La tua parola è una lampada al mio piede' (Salmo 119:105)."
  ]
};

const BibleChatbot: React.FC<BibleChatbotProps> = ({ onClose, onInteraction }) => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: t.chatbotWelcome || "Benvenuto! Sono l'assistente biblico. Chiedimi della Bibbia!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase();

    if (msg.includes('grazia') || msg.includes('grace')) {
      return defaultResponses.grace[Math.floor(Math.random() * defaultResponses.grace.length)];
    }
    if (msg.includes('misericordia') || msg.includes('mercy')) {
      return defaultResponses.mercy[Math.floor(Math.random() * defaultResponses.mercy.length)];
    }
    if (msg.includes('amore') || msg.includes('love') || msg.includes('amor')) {
      return defaultResponses.love[Math.floor(Math.random() * defaultResponses.love.length)];
    }
    if (msg.includes('fede') || msg.includes('faith')) {
      return defaultResponses.faith[Math.floor(Math.random() * defaultResponses.faith.length)];
    }
    if (msg.includes('speranza') || msg.includes('hope')) {
      return defaultResponses.hope[Math.floor(Math.random() * defaultResponses.hope.length)];
    }

    return defaultResponses.default[Math.floor(Math.random() * defaultResponses.default.length)];
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    onInteraction();

    setTimeout(() => {
      const botResponse: Message = {
        role: 'assistant',
        content: getBotResponse(input),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 800 + Math.random() * 400);
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleRegenerate = () => {
    if (messages.length < 2) return;

    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMessage) return;

    setIsTyping(true);

    setTimeout(() => {
      const newResponse: Message = {
        role: 'assistant',
        content: getBotResponse(lastUserMessage.content),
        timestamp: new Date()
      };

      setMessages(prev => {
        const newMessages = [...prev];
        const lastAssistantIndex = newMessages.map(m => m.role).lastIndexOf('assistant');
        if (lastAssistantIndex !== -1) {
          newMessages[lastAssistantIndex] = newResponse;
        }
        return newMessages;
      });
      setIsTyping(false);
    }, 800);
  };

  const suggestions = [
    t.chatbotSuggestion1 || "Parlami della grazia",
    t.chatbotSuggestion2 || "Cos'è la fede?",
    t.chatbotSuggestion3 || "L'amore nella Bibbia"
  ];

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl h-[600px] flex flex-col">
        <CardHeader className="border-b flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">{t.chatbot || "Assistente Biblico"}</CardTitle>
              <p className="text-xs text-muted-foreground">{t.chatbotSubtitle || "Chiedi qualsiasi cosa sulla Bibbia"}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                {message.role === 'assistant' && (
                  <div className="flex gap-1 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2"
                      onClick={() => handleCopy(message.content)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    {index === messages.length - 1 && !isTyping && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={handleRegenerate}
                      >
                        <RefreshCw className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {messages.length === 1 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground text-center">{t.suggestedQuestions || "Domande suggerite"}</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestions.map((suggestion, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => setInput(suggestion)}
                    className="text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={t.chatbotPlaceholder || "Fai una domanda sulla Bibbia..."}
              className="min-h-[60px] resize-none"
            />
            <Button onClick={handleSend} disabled={!input.trim() || isTyping} size="icon" className="h-[60px] w-[60px]">
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BibleChatbot;
