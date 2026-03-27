'use client'

import { Label } from '@/components/ui/label'
import { Combobox } from '@/components/ui/combobox'
import { DatePicker } from '@/components/ui/date-picker'

type Option = { value: string; label: string }

type Props = {
  projectOptions: Option[]
  projectFilter: string
  onProjectFilterChange: (value: string) => void
  startDate: Date | undefined
  endDate: Date | undefined
  onStartDateChange: (value: Date | undefined) => void
  onEndDateChange: (value: Date | undefined) => void
  showUserFilter: boolean
  userOptions?: Option[]
  userFilter?: string
  onUserFilterChange?: (value: string) => void
}

export function ActivityFilters({
  projectOptions,
  projectFilter,
  onProjectFilterChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  showUserFilter,
  userOptions,
  userFilter,
  onUserFilterChange,
}: Props) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      {showUserFilter && userOptions && userFilter !== undefined && onUserFilterChange && (
        <div className="space-y-1">
          <Label>ユーザー</Label>
          <Combobox
            options={userOptions}
            value={userFilter}
            onValueChange={onUserFilterChange}
            placeholder="ユーザーを選択"
            searchPlaceholder="検索..."
          />
        </div>
      )}
      <div className="space-y-1">
        <Label>プロジェクト</Label>
        <Combobox
          options={projectOptions}
          value={projectFilter}
          onValueChange={onProjectFilterChange}
          placeholder="プロジェクトを選択"
          searchPlaceholder="検索..."
        />
      </div>
      <div className="space-y-1">
        <Label>開始日</Label>
        <DatePicker value={startDate} onValueChange={onStartDateChange} placeholder="開始日" />
      </div>
      <div className="space-y-1">
        <Label>終了日</Label>
        <DatePicker value={endDate} onValueChange={onEndDateChange} placeholder="終了日" />
      </div>
    </div>
  )
}
