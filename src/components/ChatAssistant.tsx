import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Здравствуйте! Я виртуальный помощник системы пожарной безопасности. Задайте мне вопрос о работе с платформой.',
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickQuestions = [
    'Как заполнить журнал АУПС?',
    'Как настроить уведомления?',
    'Как экспортировать данные?',
    'Как добавить документ?'
  ];

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateResponse(inputText);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const generateResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes('аупс') || lowerQuestion.includes('журнал')) {
      return 'Для заполнения журнала АУПС: перейдите в раздел "Журнал эксплуатации систем" → выберите "I. АУПС" → заполните шапку (тип установки, дату ввода) → добавьте записи о работах с указанием даты, места, вида работ и ответственного лица.';
    }
    
    if (lowerQuestion.includes('уведомлени') || lowerQuestion.includes('напоминани')) {
      return 'Для настройки уведомлений: откройте раздел "Уведомления и напоминания" → нажмите "Добавить напоминание" → выберите тип события → укажите дату и время → сохраните. Система автоматически напомнит о предстоящих проверках.';
    }
    
    if (lowerQuestion.includes('экспорт') || lowerQuestion.includes('excel')) {
      return 'Для экспорта данных: перейдите в раздел "Экспорт данных в Excel" → выберите нужные разделы журнала → укажите период → нажмите "Экспортировать". Система сформирует файл Excel со всеми записями.';
    }
    
    if (lowerQuestion.includes('документ') || lowerQuestion.includes('файл')) {
      return 'Для загрузки документов: откройте раздел "Документация" или "Исполнительная документация" → нажмите "Загрузить файл" → выберите файл (PDF, DOC, DOCX, XLS, XLSX, JPG, PNG) → добавьте описание → сохраните. Максимальный размер: 10 МБ.';
    }

    if (lowerQuestion.includes('помощ') || lowerQuestion.includes('поддержк')) {
      return 'По вопросам технической поддержки обращайтесь к разработчику системы:\nБикбов Ильяс Хамматович\nEmail: iliyas.bikbov@rusal.com\n\nТакже вы можете изучить раздел "Вопросы и ответы" с подробными инструкциями.';
    }

    if (lowerQuestion.includes('характеристик') || lowerQuestion.includes('объект')) {
      return 'Для заполнения характеристик объекта: выберите раздел "Характеристики объекта" → заполните наименование, класс функциональной пожарной опасности (Ф1.1, Ф2.1 и т.д.), дату ввода, адрес, степень огнестойкости и другие параметры → нажмите "Сохранить".';
    }

    return 'Спасибо за вопрос! Для получения подробной информации рекомендую:\n\n1. Изучить раздел "Вопросы и ответы" → "Инструкция по заполнению"\n2. Посмотреть "Часто задаваемые вопросы"\n3. Связаться с технической поддержкой: iliyas.bikbov@rusal.com\n\nЧем еще могу помочь?';
  };

  const handleQuickQuestion = (question: string) => {
    setInputText(question);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-20 w-20 rounded-full shadow-2xl z-50 hover:scale-110 transition-transform duration-300 bg-transparent border-0 p-0"
      >
        <img 
          src="https://cdn.poehali.dev/files/EocDsQ33PQA.jpg" 
          alt="Помощник пожарной безопасности" 
          className="h-full w-full object-cover rounded-full animate-bounce"
          style={{
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))'
          }}
        />
      </button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col">
      <CardHeader className="border-b bg-primary text-primary-foreground flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="https://cdn.poehali.dev/files/EocDsQ33PQA.jpg" 
              alt="Помощник" 
              className="h-8 w-8 rounded-full object-cover"
            />
            <CardTitle className="text-base">Помощник пожарной безопасности</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 hover:bg-primary-foreground/20"
          >
            <Icon name="X" size={18} />
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-xs opacity-90">Онлайн</span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.sender === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <p className="text-sm whitespace-pre-line">{message.text}</p>
              <span className="text-xs opacity-70 mt-1 block">
                {message.timestamp.toLocaleTimeString('ru-RU', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-2">
              <div className="flex gap-1">
                <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"></div>
                <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <div className="border-t p-4 flex-shrink-0 space-y-3">
        {messages.length === 1 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Быстрые вопросы:</p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs"
                  onClick={() => handleQuickQuestion(question)}
                >
                  {question}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Введите ваш вопрос..."
            className="resize-none"
            rows={2}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isTyping}
            size="icon"
            className="h-full"
          >
            <Icon name="Send" size={18} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ChatAssistant;