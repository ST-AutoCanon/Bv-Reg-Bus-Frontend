// export type FormValue = string | boolean | number;

// export type FormValues = Record<string, FormValue>;

// export type VisibilityRule = {
//   field: string;
//   operator:
//     | "equals"
//     | "notEquals"
//     | "contains"
//     | "notContains"
//     | "isTrue"
//     | "isFalse"
//     | "isEmpty"
//     | "isNotEmpty";
//   value?: string | boolean | number;
// };

// export const isVisible = (
//   visibility: VisibilityRule | VisibilityRule[] | undefined,
//   values: FormValues,
// ): boolean => {
//   if (!visibility) {
//     return true;
//   }

//   const rules = Array.isArray(visibility)
//     ? visibility
//     : [visibility];

//   return rules.every((rule) => {
//     const currentValue = values[rule.field];

//     switch (rule.operator) {
//       case "equals":
//         return currentValue === rule.value;

//       case "notEquals":
//         return currentValue !== rule.value;

//       case "contains":
//         return String(currentValue ?? "")
//           .toLowerCase()
//           .includes(String(rule.value ?? "").toLowerCase());

//       case "notContains":
//         return !String(currentValue ?? "")
//           .toLowerCase()
//           .includes(String(rule.value ?? "").toLowerCase());

//       case "isTrue":
//         return currentValue === true;

//       case "isFalse":
//         return currentValue === false;

//       case "isEmpty":
//         return (
//           currentValue === undefined ||
//           currentValue === null ||
//           currentValue === ""
//         );

//       case "isNotEmpty":
//         return (
//           currentValue !== undefined &&
//           currentValue !== null &&
//           currentValue !== ""
//         );

//       default:
//         return true;
//     }
//   });
// };


export type FormValue = string | boolean | number;

export type FormValues = Record<
string,
FormValue | Record<string, FormValue>

> ;

export type VisibilityRule = {
field: string;
operator:
| "equals"
| "notEquals"
| "contains"
| "notContains"
| "isTrue"
| "isFalse"
| "isEmpty"
| "isNotEmpty";
value?: string | boolean | number;
};

export const isVisible = (
visibility: VisibilityRule | VisibilityRule[] | undefined,
values: FormValues,
): boolean => {
if (!visibility) {
return true;
}

const rules = Array.isArray(visibility)
? visibility
: [visibility];

return rules.every((rule) => {
const directValue = values[rule.field];

const currentValue =
  directValue !== null &&
  typeof directValue === "object"
    ? undefined
    : directValue;

switch (rule.operator) {
  case "equals":
    return currentValue === rule.value;

  case "notEquals":
    return currentValue !== rule.value;

  case "contains":
    return String(currentValue ?? "")
      .toLowerCase()
      .includes(String(rule.value ?? "").toLowerCase());

  case "notContains":
    return !String(currentValue ?? "")
      .toLowerCase()
      .includes(String(rule.value ?? "").toLowerCase());

  case "isTrue":
    return currentValue === true;

  case "isFalse":
    return currentValue === false;

  case "isEmpty":
    return (
      currentValue === undefined ||
      currentValue === null ||
      currentValue === ""
    );

  case "isNotEmpty":
    return (
      currentValue !== undefined &&
      currentValue !== null &&
      currentValue !== ""
    );

  default:
    return true;
}


});
};