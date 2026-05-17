import { useState, useRef } from 'react';
import { foodApi } from '../api';
import { useToast } from '../context/ToastContext';
import { Spinner, EmptyState } from '../components/UI';

const POPULAR = ['Roti', 'Rice', 'Dal', 'Chicken', 'Paneer', 'Egg', 'Oats', 'Banana', 'Dosa', 'Curd'];

const MACRO_COLORS = {
  protein: '#1e4334',
  carbs: '#d97706',
  fats: '#b45309',
  fiber: '#45645e',
};

function FoodCard({ food, delay }) {
  return (
    <div className="card animate-slide-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-semibold text-on-surface">{food.name}</h3>
            {food.category && (
              <span className="text-[10px] font-bold uppercase tracking-wide bg-surface-container text-secondary px-2 py-0.5 rounded-full">
                {food.category}
              </span>
            )}
          </div>
          <p className="text-xs text-outline mt-1">Per {food.servingSize}{food.servingUnit}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-2xl font-black text-primary leading-none">{Math.round(food.nutrition?.calories || 0)}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-outline">kcal</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 pt-4 border-t border-emerald-900/5">
        {['protein', 'carbs', 'fats', 'fiber'].map((key) => (
          <div key={key} className="text-center">
            <p className="text-base font-bold" style={{ color: MACRO_COLORS[key] }}>
              {food.nutrition?.[key] || 0}g
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline mt-0.5">{key}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FoodSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const timer = useRef(null);
  const toast = useToast();

  async function doSearch(q) {
    if (q.length < 2) { setResults([]); setSearched(false); return; }
    setLoading(true);
    try {
      const res = await foodApi.search(q);
      setResults(res || []);
      setSearched(true);
    } catch (err) {
      toast(err.response?.data?.message || 'Search failed', 'error');
    }
    setLoading(false);
  }

  function handleChange(q) {
    setQuery(q);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => doSearch(q), 400);
  }

  function handleChip(s) {
    setQuery(s);
    doSearch(s);
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="animate-slide-up">
        <h1 className="font-serif text-4xl text-primary">Food Library</h1>
        <p className="text-sm text-outline mt-2">Search nutritional information for any food item</p>
      </div>

      {/* Search input */}
      <div className="relative animate-slide-up delay-50">
        <span
          className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline"
          style={{ fontSize: 22 }}
        >
          search
        </span>
        <input
          className="input pl-12 py-4 text-base rounded-2xl"
          placeholder="Search for roti, rice, dal, chicken..."
          value={query}
          onChange={(e) => handleChange(e.target.value)}
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Spinner size={20} />
          </div>
        )}
      </div>

      {/* Popular chips */}
      {!searched && (
        <div className="animate-slide-up delay-100">
          <p className="text-[10px] font-bold tracking-widest uppercase text-outline mb-3">Popular Searches</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR.map((s) => (
              <button
                key={s}
                onClick={() => handleChip(s)}
                className="px-4 py-2 rounded-full text-sm font-medium bg-white border-2 border-outline-variant/30 text-secondary
                  hover:border-primary hover:text-primary transition-all duration-150"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {searched && !loading && (
        <>
          <p className="text-sm text-outline animate-fade-in">
            {results.length} result{results.length !== 1 ? 's' : ''} for "<strong className="text-on-surface">{query}</strong>"
          </p>
          {results.length === 0 ? (
            <div className="card">
              <EmptyState
                icon="search_off"
                title={`No results for "${query}"`}
                description="Try a different spelling or a broader search term."
              />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {results.map((f, i) => (
                <FoodCard key={f.id} food={f} delay={i * 40} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
