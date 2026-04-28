import type { ControllerRenderProps, FieldPath, FieldValues } from "react-hook-form";

/**
 * Map RHF `Controller` field props to a native text `<input>`.
 * Ensures a stable controlled `value` string.
 */
export function rhfTextInputProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>(field: ControllerRenderProps<TFieldValues, TName>) {
  return {
    name: field.name,
    ref: field.ref,
    onBlur: field.onBlur,
    onChange: field.onChange,
    value: (field.value as string | undefined) ?? "",
  };
}
