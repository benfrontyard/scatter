import { defaultProjectFont } from "@/config/fonts";
import { useAvailableFonts } from "@/hooks/use-available-fonts";
import { loadGoogleFont } from "@/lib/google-fonts";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FontSelectorProps = {
  value: string | undefined;
  onChange: (family: string) => void;
};

export function FontSelector({ value, onChange }: FontSelectorProps) {
  const fontGroups = useAvailableFonts();
  const selected = value ?? defaultProjectFont;

  return (
    <div className="space-y-1.5">
      <Label htmlFor="project-font">Typeface</Label>
      <Select
        value={selected}
        onValueChange={(family) => {
          loadGoogleFont(family);
          onChange(family);
        }}
      >
        <SelectTrigger id="project-font" className="h-8 w-full text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {fontGroups.map((group) => (
            <SelectGroup key={group.label}>
              <SelectLabel>{group.label}</SelectLabel>
              {group.fonts.map((family) => (
                <SelectItem key={family} value={family} style={{ fontFamily: family }}>
                  {family}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
