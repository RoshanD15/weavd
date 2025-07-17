export default function AddFragranceModal({ show, onClose, onAdd }) {
    if (!show) return null;
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div
          className="
            bg-white/30
            backdrop-blur-xl
            border border-white/40
            rounded-2xl
            shadow-2xl
            w-96
            relative
            p-8
            flex flex-col
          "
          style={{ WebkitBackdropFilter: "blur(20px)" }} // For Safari
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-2xl"
            aria-label="Close"
          >
            &times;
          </button>
          <h2 className="text-2xl font-bold mb-6 text-center">Add New Fragrance</h2>
          <form
            onSubmit={e => {
              e.preventDefault();
              onAdd();
            }}
          >
            <input
              className="border rounded w-full mb-4 p-2 bg-white/70 placeholder-gray-400"
              type="text"
              placeholder="Fragrance Name"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
            >
              Add
            </button>
          </form>
        </div>
      </div>
    );
  }