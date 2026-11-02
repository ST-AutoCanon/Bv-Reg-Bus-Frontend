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

type MainCategoriesProps = {
  categories: Category[];
  selectedCategory: number;
  values: FormValues;
  onCategoryChange: (index: number) => void;
};

const MainCategories = ({
  categories,
  selectedCategory,
  values,
  onCategoryChange,
}: MainCategoriesProps) => {
  const visibleCategories = categories
    .map((category, originalIndex) => ({
      category,
      originalIndex,
    }))
    .filter(({ category }) => isVisible(category.visibility, values));

  return (
    <div className="border-b bg-white">
      <div className="flex gap-2 overflow-x-auto px-6 py-4">
        {visibleCategories.map(({ category, originalIndex }) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onCategoryChange(originalIndex)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
              selectedCategory === originalIndex
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MainCategories;
