import { TButton, TTable } from "vue-tailwind/src/themes/default";

const TButton = {
  // baseClass: 'border block rounded inline-flex items-center justify-center',
  baseClass: "rounded-lg border block inline-flex items-center justify-center",
  // primaryClass: 'text-white bg-blue-500 border-blue-500 hover:bg-blue-600 hover:border-blue-600',
  primaryClass: "text-white bg-purple-500 border-purple-500 hover:bg-purple-600 hover:border-purple-600",
};

const MyOwnTheme = {
  TTable,
  TButton,
};

export default MyOwnTheme;
