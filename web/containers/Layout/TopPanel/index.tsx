import { Fragment } from 'react'

import { useTheme } from 'next-themes'

import { Button } from '@janhq/joi'
import { useAtom, useAtomValue } from 'jotai'
import {
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  PanelRightOpenIcon,
  PanelRightCloseIcon,
  SunIcon,
  MoonIcon,
} from 'lucide-react'
import { twMerge } from 'tailwind-merge'

import { MainViewState } from '@/constants/screens'

import {
  mainViewStateAtom,
  showLeftPanelAtom,
  showRightPanelAtom,
} from '@/helpers/atoms/App.atom'

const TopPanel = () => {
  const mainViewState = useAtomValue(mainViewStateAtom)
  const [showLeftPanel, setShowLeftPanel] = useAtom(showLeftPanelAtom)
  const [showRightPanel, setShowRightPanel] = useAtom(showRightPanelAtom)

  const { theme: currentTheme, setTheme } = useTheme()

  const handleClickTheme = (theme: string) => {
    if (theme === 'dark') {
      window?.electronAPI.setNativeThemeDark()
    } else {
      window?.electronAPI.setNativeThemeLight()
    }
    setTheme(theme)
  }

  return (
    <div
      className={twMerge(
        'fixed z-50 flex h-9 w-full items-center border-y border-[hsla(var(--top-panel-border))] bg-[hsla(var(--top-panel-bg))] px-4 backdrop-blur-lg',
        isMac && 'border-t-0 pl-20'
      )}
    >
      <div className="flex w-full items-center justify-between text-[hsla(var(--text-secondary))]">
        <div className="unset-drag flex cursor-pointer gap-x-0.5">
          {mainViewState !== MainViewState.Hub && (
            <Fragment>
              {showLeftPanel ? (
                <Button theme="icon" onClick={() => setShowLeftPanel(false)}>
                  <PanelLeftCloseIcon size={16} />
                </Button>
              ) : (
                <Button theme="icon" onClick={() => setShowLeftPanel(true)}>
                  <PanelLeftOpenIcon size={16} />
                </Button>
              )}
            </Fragment>
          )}
        </div>
        <div className="unset-drag flex gap-x-2">
          {mainViewState !== MainViewState.Hub &&
            mainViewState !== MainViewState.Settings && (
              <Fragment>
                {showRightPanel ? (
                  <Button theme="icon" onClick={() => setShowRightPanel(false)}>
                    <PanelRightOpenIcon size={16} />
                  </Button>
                ) : (
                  <Button theme="icon" onClick={() => setShowRightPanel(true)}>
                    <PanelRightCloseIcon size={16} />
                  </Button>
                )}
              </Fragment>
            )}
          {currentTheme === 'light' ? (
            <Button
              theme="icon"
              onClick={() => {
                handleClickTheme('dark')
              }}
            >
              <MoonIcon size={16} className="cursor-pointer" />
            </Button>
          ) : (
            <Button
              theme="icon"
              onClick={() => {
                handleClickTheme('light')
              }}
            >
              <SunIcon size={16} className="cursor-pointer" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
export default TopPanel
