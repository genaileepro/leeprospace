'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import OpenAI from 'openai';
import { FaVolumeUp } from 'react-icons/fa';

const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
});

interface TranslationResult {
    english: string;
    korean: string;
}

const initialSentences = [
    "What's your favorite food?",
    'I enjoy watching movies.',
    'Where are you going?',
    'The book is on the table.',
    'I need to study harder.',
    'Can you help me?',
    'This coffee tastes good.',
    'I like traveling.',
    'What time is it now?',
    'See you tomorrow!',
];

export default function Translator() {
    const [currentSentence, setCurrentSentence] =
        useState<TranslationResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const speakText = async (text: string) => {
        try {
            setIsSpeaking(true);
            const response = await openai.audio.speech.create({
                model: 'tts-1-hd',
                voice: 'nova',
                input: text,
            });

            const audioBlob = new Blob([await response.arrayBuffer()], {
                type: 'audio/mp3',
            });
            const audioUrl = URL.createObjectURL(audioBlob);

            if (audioRef.current) {
                audioRef.current.src = audioUrl;
                await audioRef.current.play();
            }
        } catch (err) {
            console.error('TTS error:', err);
            setError('음성 변환 중 오류가 발생했습니다.');
        } finally {
            setIsSpeaking(false);
        }
    };

    const getTranslation = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const randomEnglish =
                initialSentences[
                    Math.floor(Math.random() * initialSentences.length)
                ];

            const completion = await openai.chat.completions.create({
                messages: [
                    {
                        role: 'system',
                        content: `Provide a bilingual sentence in English and Korean for language study.

Steps:
1. Upon receiving a request, identify or generate a simple sentence.
2. Translate the sentence into Korean if the language provided is English or into English if the language provided is Korean.
3. Provide both sentences alongside each other for comparison and study.

Notes:
- Ensure translations maintain the meaning of the original sentence as closely as possible.
- Use simple and clear sentences suitable for language learners.
- Respond with ONLY the Korean translation, no additional text or formatting.`,
                    },
                    {
                        role: 'user',
                        content: randomEnglish,
                    },
                ],
                model: 'gpt-4',
                temperature: 0.7,
            });

            const koreanTranslation =
                completion.choices[0]?.message?.content?.trim() || '번역 실패';

            setCurrentSentence({
                english: randomEnglish,
                korean: koreanTranslation,
            });
        } catch (err) {
            console.error('Translation error:', err);
            setError('번역 중 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-lg border border-gray-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <audio ref={audioRef} onEnded={() => setIsSpeaking(false)} />

            <motion.h2
                className="text-lg font-semibold text-gray-400 mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                오늘의 영어 문장
            </motion.h2>

            <motion.button
                onClick={getTranslation}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-colors mb-6"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
            >
                {isLoading ? '생성 중...' : '생성하기'}
            </motion.button>

            {error && (
                <motion.div
                    className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    {error}
                </motion.div>
            )}

            {currentSentence && (
                <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-blue-400">
                                English
                            </h3>
                            <motion.button
                                onClick={() =>
                                    speakText(currentSentence.english)
                                }
                                className={`p-2 rounded-full hover:bg-gray-700/50 transition-colors ${
                                    isSpeaking
                                        ? 'text-blue-400'
                                        : 'text-gray-400'
                                }`}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                disabled={isSpeaking}
                            >
                                <FaVolumeUp size={20} />
                            </motion.button>
                        </div>
                        <p className="text-white text-lg p-3 bg-gray-700/30 rounded-lg">
                            {currentSentence.english}
                        </p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-purple-400">
                            Korean
                        </h3>
                        <p className="text-white text-lg p-3 bg-gray-700/30 rounded-lg">
                            {currentSentence.korean}
                        </p>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
