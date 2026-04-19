interface Props {
  onFileSelect: (files: FileList | null) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export default function UploadZone({ onFileSelect, onDragOver, onDrop }: Props) {
  return (
    <div 
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="border-2 border-dashed border-emerald-300 dark:border-emerald-700 rounded-3xl p-8 sm:p-16 text-center mb-8 hover:border-emerald-500 transition-all"
    >
      <div className="text-6xl sm:text-7xl mb-6">📤</div>
      <h3 className="text-2xl sm:text-3xl font-semibold mb-4">Drop dine CSV-filer her</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-8">eller</p>
      
      <label className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-lg sm:text-xl px-8 sm:px-10 py-4 sm:py-5 rounded-3xl cursor-pointer hover:scale-105 transition shadow-xl">
        Vælg filer
        <input type="file" accept=".csv" multiple onChange={(e) => onFileSelect(e.target.files)} className="hidden" />
      </label>
    </div>
  );
}