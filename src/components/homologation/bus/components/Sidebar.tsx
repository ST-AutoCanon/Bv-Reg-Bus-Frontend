import {
  isVisible,
  type FormValues,
  type VisibilityRule,
} from "../utils/visibility";

import {
  Building2,
  Factory,
  Bus,
  Weight,
  CircleGauge,
  FileText,
  Bell,
  Settings,
  Building,
  Warehouse,
  Disc3,
  Cog,
  Construction,
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
  collapsed: boolean;
};

const getCategoryIcon = (name: string) => {
  const value = name.trim().toLowerCase();

  if (value.includes("plant")) return Factory;
  if (value.includes("manufacturer")) return Building2;
  if (value.includes("vehicle")) return Bus;
  if (value.includes("weighment")) return Weight;
  if (value.includes("tyre")) return Disc3;
  if (value.includes("wheel rim")) return Cog;

  return FileText;
};

const Sidebar = ({
  categories,
  selectedCategory,
  values,
  onCategoryChange,
  collapsed,
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
      className={`
    flex h-full min-h-0 shrink-0 flex-col
    overflow-x-hidden overflow-y-auto
    bg-[#263B3D]
border-r border-[#D5E1DC]
    transition-all duration-300 ease-in-out
    ${collapsed ? "w-[76px]" : "w-[300px]"}
  `}
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
  flex min-h-[52px] w-full items-center
  ${collapsed ? "justify-center px-0" : "gap-4 px-6"}
  py-3 text-left text-sm font-medium
  transition-colors duration-200
 ${isSelected
  ? "bg-[#205F8F] text-white"
  : "bg-transparent text-white hover:bg-[#23658F]"
}
`}
            >
              <Icon
                size={21}
                strokeWidth={2}
                className="shrink-0"
              />

              {!collapsed && (
                <span className="whitespace-nowrap">
                  {category.name}
                </span>
              )}
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
                className={`
  flex min-h-[52px] items-center
  ${collapsed ? "justify-center px-0" : "gap-4 px-6"}
  py-3 text-sm font-medium text-white
`}
              >
                <Icon
                  size={21}
                  strokeWidth={2}
                  className="shrink-0"
                />

                {!collapsed && (
                  <span className="whitespace-nowrap">
                    {item.name}
                  </span>
                )}
              </div>
            );
          })}
        </div>

      </nav>
    </aside>
  );
};

export default Sidebar;