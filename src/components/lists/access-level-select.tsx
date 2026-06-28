"use client";

import { useTranslations } from "next-intl";

import { SelectField } from "@/components/ui/select-field";
import type { ListAccessLevel } from "@/lib/types/user-lists";

const LEVELS: ListAccessLevel[] = ["VIEW", "REVIEWER", "EDIT"];

type AccessLevelSelectProps = {
  id?: string;
  value: ListAccessLevel;
  onChange: (level: ListAccessLevel) => void;
  disabled?: boolean;
};

export function AccessLevelSelect({
  id,
  value,
  onChange,
  disabled,
}: AccessLevelSelectProps) {
  const t = useTranslations("lists.accessLevel");

  return (
    <SelectField
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value as ListAccessLevel)}
      disabled={disabled}
    >
      {LEVELS.map((level) => (
        <option key={level} value={level}>
          {t(level)}
        </option>
      ))}
    </SelectField>
  );
}
