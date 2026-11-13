import {
  isVisible,
  type FormValues,
  type VisibilityRule,
} from "../utils/visibility";

type SubCategory = {
  id: string;
  name: string;
  visibility?: VisibilityRule | VisibilityRule[];
};

type SubCategoriesProps = {
  categories: SubCategory[];
  selectedCategory: number;
  values: FormValues;
  onCategoryChange: (index: number) => void;
};

const SubCategories = ({
  categories,
  selectedCategory,
  values,
  onCategoryChange,
}: SubCategoriesProps) => {
  const visibleCategories = categories
    .map((category, originalIndex) => ({
      category,
      originalIndex,
    }))
    .filter(({ category }) => isVisible(category.visibility, values));

  return (
    <div className="border-b bg-gray-50">
      <div className="flex gap-2 overflow-x-auto px-6 py-3">
        {visibleCategories.map(({ category, originalIndex }) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onCategoryChange(originalIndex)}
            className={`whitespace-nowrap rounded-md px-4 py-2 text-sm transition ${
              selectedCategory === originalIndex
                ? "bg-white font-semibold text-blue-600 shadow-sm"
                : "text-gray-600 hover:bg-white"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SubCategories;
