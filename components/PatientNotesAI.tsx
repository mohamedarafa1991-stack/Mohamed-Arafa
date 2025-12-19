
import React, { useState, useRef } from 'react';
import { Mic, Square, Sparkles, Loader2, Save, FileText } from 'lucide-react';
import { medicalAiService } from '../services/geminiService';

interface PatientNotesAIProps {
  patientId: string;
  onSave: (note: string) => void;
}

const PatientNotesAI: React.FC<PatientNotesAIProps> = ({ patientId, onSave }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/mp3' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          setIsProcessing(true);
          try {
            const result = await medicalAiService.processVoiceNote(base64Audio);
            setNoteContent(prev => prev + '\n' + result);
          } catch (err) {
            console.error("AI Transcription failed", err);
          } finally {
            setIsProcessing(false);
          }
        };
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      alert("Microphone access denied or not available.");
    }
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setIsRecording(false);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden transition-all">
      <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <FileText size={20} className="text-blue-600" />
          <h3 className="text-sm font-black uppercase tracking-widest dark:text-white">AI Dictation & Notes</h3>
        </div>
        <div className="flex space-x-2">
          {!isRecording ? (
            <button 
              onClick={startRecording}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              <Mic size={16} />
              <span>Start Dictation</span>
            </button>
          ) : (
            <button 
              onClick={stopRecording}
              className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold animate-pulse"
            >
              <Square size={16} />
              <span>Stop & Process</span>
            </button>
          )}
        </div>
      </div>
      
      <div className="p-8">
        <textarea 
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          placeholder="Clinical findings, assessment, and plans..."
          className="w-full h-48 bg-gray-50 dark:bg-slate-900 border-none rounded-2xl p-6 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white font-medium text-sm resize-none transition-all shadow-inner"
        />
        
        <div className="mt-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {isProcessing && (
              <div className="flex items-center space-x-2 text-blue-600 text-xs font-black uppercase tracking-widest">
                <Loader2 size={16} className="animate-spin" />
                <span>AI is structuring your note...</span>
              </div>
            )}
          </div>
          <button 
            onClick={() => { onSave(noteContent); setNoteContent(''); }}
            disabled={!noteContent}
            className="flex items-center space-x-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-50 transition-all active:scale-95"
          >
            <Save size={18} />
            <span>Commit to EHR</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientNotesAI;
