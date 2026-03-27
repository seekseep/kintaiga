import { describe, it, expect } from 'vitest'
import { parseCommand, applyCommand, computePreview } from '.'

describe('parseCommand', () => {
  describe('shift コマンド', () => {
    it('+1h を両方1時間シフトとしてパースする', () => {
      expect(parseCommand('+1h')).toEqual({
        ok: true,
        command: { type: 'shift', target: 'both', offsetMinutes: 60 },
      })
    })

    it('-30m を両方30分戻すとしてパースする', () => {
      expect(parseCommand('-30m')).toEqual({
        ok: true,
        command: { type: 'shift', target: 'both', offsetMinutes: -30 },
      })
    })

    it('start +1h を開始のみシフトとしてパースする', () => {
      expect(parseCommand('start +1h')).toEqual({
        ok: true,
        command: { type: 'shift', target: 'start', offsetMinutes: 60 },
      })
    })

    it('end -30m を終了のみシフトとしてパースする', () => {
      expect(parseCommand('end -30m')).toEqual({
        ok: true,
        command: { type: 'shift', target: 'end', offsetMinutes: -30 },
      })
    })

    it('+0h はエラーを返す', () => {
      const result = parseCommand('+0h')
      expect(result.ok).toBe(false)
    })
  })

  describe('set_time コマンド', () => {
    it('start 09:00 を開始時刻設定としてパースする', () => {
      expect(parseCommand('start 09:00')).toEqual({
        ok: true,
        command: { type: 'set_time', target: 'start', hours: 9, minutes: 0 },
      })
    })

    it('end 18:00 を終了時刻設定としてパースする', () => {
      expect(parseCommand('end 18:00')).toEqual({
        ok: true,
        command: { type: 'set_time', target: 'end', hours: 18, minutes: 0 },
      })
    })

    it('25:00 はエラーを返す', () => {
      const result = parseCommand('start 25:00')
      expect(result.ok).toBe(false)
    })

    it('09:60 はエラーを返す', () => {
      const result = parseCommand('start 09:60')
      expect(result.ok).toBe(false)
    })
  })

  describe('set_date コマンド', () => {
    it('date 2026-03-25 を両方の日付設定としてパースする', () => {
      expect(parseCommand('date 2026-03-25')).toEqual({
        ok: true,
        command: { type: 'set_date', target: 'both', date: '2026-03-25' },
      })
    })

    it('start date 2026-03-25 を開始日付設定としてパースする', () => {
      expect(parseCommand('start date 2026-03-25')).toEqual({
        ok: true,
        command: { type: 'set_date', target: 'start', date: '2026-03-25' },
      })
    })
  })

  describe('エラーケース', () => {
    it('空入力はエラーを返す', () => {
      const result = parseCommand('')
      expect(result.ok).toBe(false)
    })

    it('認識できない入力はエラーを返す', () => {
      const result = parseCommand('foo bar')
      expect(result.ok).toBe(false)
    })
  })
})

describe('applyCommand', () => {
  const activity = {
    startedAt: '2026-03-25T09:00:00.000Z',
    endedAt: '2026-03-25T18:00:00.000Z',
  }

  const ongoingActivity = {
    startedAt: '2026-03-25T09:00:00.000Z',
    endedAt: null,
  }

  it('shift で開始と終了を1時間進める', () => {
    const result = applyCommand(
      { type: 'shift', target: 'both', offsetMinutes: 60 },
      activity
    )
    expect(result.startedAt).toBe('2026-03-25T10:00:00.000Z')
    expect(result.endedAt).toBe('2026-03-25T19:00:00.000Z')
  })

  it('shift start で開始のみシフトする', () => {
    const result = applyCommand(
      { type: 'shift', target: 'start', offsetMinutes: 60 },
      activity
    )
    expect(result.startedAt).toBe('2026-03-25T10:00:00.000Z')
    expect(result.endedAt).toBe('2026-03-25T18:00:00.000Z')
  })

  it('shift で null の endedAt はスキップする', () => {
    const result = applyCommand(
      { type: 'shift', target: 'both', offsetMinutes: 60 },
      ongoingActivity
    )
    expect(result.startedAt).toBe('2026-03-25T10:00:00.000Z')
    expect(result.endedAt).toBeNull()
  })

  it('set_time で開始時刻を設定する（日付維持）', () => {
    const result = applyCommand(
      { type: 'set_time', target: 'start', hours: 10, minutes: 30 },
      activity
    )
    expect(new Date(result.startedAt).getUTCHours()).toBe(10)
    expect(new Date(result.startedAt).getUTCMinutes()).toBe(30)
    expect(new Date(result.startedAt).getUTCDate()).toBe(25)
  })

  it('set_time end で null の endedAt はスキップする', () => {
    const result = applyCommand(
      { type: 'set_time', target: 'end', hours: 18, minutes: 0 },
      ongoingActivity
    )
    expect(result.endedAt).toBeNull()
  })

  it('set_date で両方の日付を変更する（時刻維持）', () => {
    const result = applyCommand(
      { type: 'set_date', target: 'both', date: '2026-04-01' },
      activity
    )
    expect(result.startedAt).toContain('2026-04-01')
    expect(result.endedAt).toContain('2026-04-01')
  })

  it('set_date で null の endedAt はスキップする', () => {
    const result = applyCommand(
      { type: 'set_date', target: 'both', date: '2026-04-01' },
      ongoingActivity
    )
    expect(result.startedAt).toContain('2026-04-01')
    expect(result.endedAt).toBeNull()
  })
})

describe('computePreview', () => {
  it('複数のアクティビティに対してプレビューを計算する', () => {
    const activities = [
      { id: '1', startedAt: '2026-03-25T09:00:00.000Z', endedAt: '2026-03-25T18:00:00.000Z' },
      { id: '2', startedAt: '2026-03-26T10:00:00.000Z', endedAt: null },
    ]
    const command = { type: 'shift' as const, target: 'both' as const, offsetMinutes: 60 }
    const preview = computePreview(command, activities)

    expect(preview.size).toBe(2)
    expect(preview.get('1')?.startedAt).toBe('2026-03-25T10:00:00.000Z')
    expect(preview.get('1')?.endedAt).toBe('2026-03-25T19:00:00.000Z')
    expect(preview.get('2')?.startedAt).toBe('2026-03-26T11:00:00.000Z')
    expect(preview.get('2')?.endedAt).toBeNull()
  })

  it('空配列では空のMapを返す', () => {
    const command = { type: 'shift' as const, target: 'both' as const, offsetMinutes: 60 }
    const preview = computePreview(command, [])
    expect(preview.size).toBe(0)
  })
})
