import {
  isVisible,
  type FormValues,
  type VisibilityRule,
} from "../utils/visibility";

type Category = {
  id: string;
  name: string;
  visibility?: VisibilityRule | VisibilityRule[];
};

type SidebarProps = {
  categories: Category[];
  selectedCategory: number;
  values: FormValues;
  onCategoryChange: (index: number) => void;
};

const Sidebar = ({
  categories,
  selectedCategory,
  values,
  onCategoryChange,
}: SidebarProps) => {
  const visibleCategories = categories
    .map((category, originalIndex) => ({
      category,
      originalIndex,
    }))
    .filter(({ category }) => isVisible(category.visibility, values));

  return (
    <aside className="hidden min-h-screen w-64 border-r bg-white lg:block">
      <div className="border-b px-6 py-5">
        <h1 className="text-lg font-semibold text-gray-900">Details</h1>
      </div>

      <nav className="p-4">
        {visibleCategories.map(({ category, originalIndex }) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onCategoryChange(originalIndex)}
            className={`mb-2 w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
              selectedCategory === originalIndex
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {category.name}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
