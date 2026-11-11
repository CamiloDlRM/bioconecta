import Link from 'next/link'
import { Logo } from '@/components/brand/logo'
import { buttonVariants } from '@/components/ui/button'
import { getCurrentProfile } from '@/lib/data'
import { MainNav } from './main-nav'
import { MobileNav } from './mobile-nav'
import { ThemeToggle } from './theme-toggle'
import { UserMenu } from './user-menu'

export async function SiteHeader() {
  const profile = await getCurrentProfile()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/92 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" aria-label="BioConecta — Inicio" className="rounded-lg">
            <Logo />
          </Link>
          <MainNav />
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="hidden items-center gap-2 md:flex">
            {profile ? (
              <UserMenu profile={profile} />
            ) : (
              <>
                <Link href="/ingresar" className={buttonVariants({ variant: 'ghost' })}>
                  Ingresar
                </Link>
                <Link href="/registro" className={buttonVariants()}>
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
          <MobileNav profile={profile} />
        </div>
      </div>
    </header>
  )
}
