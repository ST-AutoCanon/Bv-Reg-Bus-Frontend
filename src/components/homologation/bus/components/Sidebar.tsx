import {
  isVisible,
  type FormValues,
  type VisibilityRule,
} from "../utils/visibility";

import {
  Building2,
  Factory,
  Bus,
  Scale,
  CircleGauge,
  FileText,
  Bell,
  Settings,
} from "lucide-react";

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

const getCategoryIcon = (name: string) => {
  const value = name.toLowerCase();

  if (value.includes("manufacturer details")) return Building2;
  if (value.includes("plant")) return Factory;
  if (value.includes("vehicle")) return Bus;
  if (value.includes("weighment")) return Scale;
  if (value.includes("tyre") || value.includes("wheel")) return CircleGauge;

  return FileText;
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
    .filter(({ category }) =>
      isVisible(category.visibility, values)
    );

  const bottomItems = [
    { name: "Documents", icon: FileText },
    { name: "Notification", icon: Bell },
    { name: "Setting", icon: Settings },
  ];

  return (
<aside
  className="
    flex
    h-full
    min-h-0
    w-full
    flex-col
    overflow-y-auto
    overflow-x-hidden
    bg-[#075441]
    border-r border-white/10
  "
>
 <nav className="flex flex-col pt-2">
        {visibleCategories.map(({ category, originalIndex }) => {
          const Icon = getCategoryIcon(category.name);
          const isSelected = selectedCategory === originalIndex;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onCategoryChange(originalIndex)}
              className={`
                flex min-h-[52px] w-full items-center gap-4
                px-6 py-3 text-left text-sm font-medium
                transition-colors duration-200
                ${
                  isSelected
                    ? "bg-[#087054] text-white"
                    : "bg-transparent text-white hover:bg-[#086047]"
                }
              `}
            >
              <Icon
                size={21}
                strokeWidth={2}
                className="shrink-0"
              />

              <span>{category.name}</span>
            </button>
          );
        })}

        {/* BOTTOM MENU ITEMS */}
       <div className="shrink-0">
          {bottomItems.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.name}
                className="
                  flex min-h-[52px] items-center gap-4
                  px-6 py-3 text-sm font-medium text-white
                "
              >
                <Icon
                  size={21}
                  strokeWidth={2}
                  className="shrink-0"
                />

                <span>{item.name}</span>
              </div>
            );
          })}
        </div>

      </nav>
    </aside>
  );
};

export default Sidebar;