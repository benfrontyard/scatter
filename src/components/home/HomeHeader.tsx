import { AppChrome, ScatterLogo } from "@/components/layout/AppChrome";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEditor } from "@/context/editor-context";
import type { UserRole } from "@/types/user";

export function HomeHeader() {
  const { user, isInternal, setUserRole, openStudio } = useEditor();

  return (
    <AppChrome
      leading={
        <>
          <ScatterLogo />
          <span className="text-sm font-semibold tracking-tight">Scatter</span>
        </>
      }
      trailing={
        <>
          {isInternal ? (
            <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={openStudio}>
              Studio
            </Button>
          ) : null}

          <Select value={user.role} onValueChange={(v) => setUserRole(v as UserRole)}>
            <SelectTrigger className="hidden h-8 w-[90px] text-[10px] xl:flex" aria-label="User role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="internal">Internal</SelectItem>
            </SelectContent>
          </Select>

          <ThemeToggle />
        </>
      }
    />
  );
}
