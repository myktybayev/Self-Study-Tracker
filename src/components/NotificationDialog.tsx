'use client';

import { useEffect } from 'react';

interface NotificationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'work' | 'break' | 'longBreak';
    onContinue: () => void;
}

export default function NotificationDialog({ isOpen, onClose, type, onContinue }: NotificationDialogProps) {
    useEffect(() => {
        if (isOpen) {
            // Play notification sound
            playNotificationSound();

            // Show browser notification if supported
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Pomodoro Timer', {
                    body: getNotificationMessage(type),
                    icon: '/favicon.ico',
                });
            }
        }
    }, [isOpen, type]);

    const playNotificationSound = () => {
        try {
            // Create audio context for notification sound
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            console.log('Audio notification not supported');
        }
    };

    const getNotificationMessage = (type: 'work' | 'break' | 'longBreak'): string => {
        switch (type) {
            case 'work':
                return 'Кішкене демалып алмадық па! 🎉';
            case 'break':
                return 'Жұмысты жалғастырамыз! 💪';
            case 'longBreak':
                return 'Көбірек демалыс керек сияқты — таймерді қой да, кішкене сергіп кел! Ноутбукқа мен қарай тұрамын, уайымдама 😉\n\n💻 Жұмысты GitHub Push жасауды ұмытпа!';
            default:
                return 'Timer completed!';
        }
    };

    const getDialogTitle = (type: 'work' | 'break' | 'longBreak'): string => {
        switch (type) {
            case 'work':
                return '🎉 Жұмыс уақыты бітті!';
            case 'break':
                return '💪 Демалыс бітті!';
            case 'longBreak':
                return '😌 Ұзақ демалыс уақыты!';
            default:
                return 'Timer Completed!';
        }
    };

    const getDialogIcon = (type: 'work' | 'break' | 'longBreak'): string => {
        switch (type) {
            case 'work':
                return '🎉';
            case 'break':
                return '💪';
            case 'longBreak':
                return '😌';
            default:
                return '⏰';
        }
    };

    const getDialogColor = (type: 'work' | 'break' | 'longBreak'): string => {
        switch (type) {
            case 'work':
                return 'bg-violet-50 border-violet-200';
            case 'break':
                return 'bg-green-50 border-green-200';
            case 'longBreak':
                return 'bg-blue-50 border-blue-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    const getButtonColor = (type: 'work' | 'break' | 'longBreak'): string => {
        switch (type) {
            case 'work':
                return 'bg-violet-600 hover:bg-violet-700';
            case 'break':
                return 'bg-green-600 hover:bg-green-700';
            case 'longBreak':
                return 'bg-blue-600 hover:bg-blue-700';
            default:
                return 'bg-gray-600 hover:bg-gray-700';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`max-w-md w-full mx-4 rounded-2xl border-2 ${getDialogColor(type)} shadow-xl`}>
                <div className="p-6 text-center">
                    {/* Icon */}
                    <div className="text-6xl mb-4">{getDialogIcon(type)}</div>

                    {/* Title */}
                    <h2 className="text-xl font-bold text-gray-800 mb-3">
                        {getDialogTitle(type)}
                    </h2>

                    {/* Message */}
                    <p className="text-gray-600 mb-6 text-lg whitespace-pre-line">
                        {getNotificationMessage(type)}
                    </p>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                        >
                            Жабу
                        </button>
                        <button
                            onClick={() => {
                                onContinue();
                                onClose();
                            }}
                            className={`flex-1 px-4 py-3 text-white rounded-lg transition font-medium ${getButtonColor(type)}`}
                        >
                            Жалғастыру
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
