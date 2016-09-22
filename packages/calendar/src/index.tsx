import * as React from 'react'
import * as css from 'classnames'
import * as moment from 'moment'

export interface CalendarProps {
  theme: CalendarTheme
  minDate?: Date
  maxDate?: Date
  date?: Date
  onChange: (d: Date) => void
}

export interface CalendarState {
  currentMonth?: Date
}

export interface CalendarTheme {
  container: string
  controls: string
  prevMonth: string
  month: string
  nextMonth: string
  heading: string
  grid: string
  dayOfWeek: string
  week: string
  day: string
  otherMonthDay: string
  selected: string
  disabled: string
}

type WeekDates = moment.Moment[]

export default class Calendar extends React.Component<CalendarProps, CalendarState> {
  state: CalendarState = {}

  componentWillReceiveProps({ date }: CalendarProps) {
    // When the value changes, reset the view date

    if (!date || !this.props.date || !moment(date).isSame(this.props.date, 'days')) {
      this.setState({ currentMonth: undefined })
    }
  }

  private currentMonth(): moment.Moment {
    return this.state.currentMonth ? moment(this.state.currentMonth) : moment()
  }

  private viewStartDate(): moment.Moment {
    return this.currentMonth().startOf('month').startOf('week')
  }

  private isDisabled(d: moment.Moment, granularity: string = 'days') {
    const { minDate, maxDate } = this.props

    return Boolean(
      (minDate && d.isBefore(minDate, granularity))
      || (maxDate && d.isAfter(maxDate, granularity))
    )
  }

  private weeks(): WeekDates[] {
    const weeks: WeekDates[] = []
    const m = this.viewStartDate()

    do {
      const week: WeekDates = []

      for (let i = 0; i < 7;  ++i) {
        week.push(m.clone())
        m.add(1, 'days')
      }

      weeks.push(week)
    } while (m.month() === this.currentMonth().month())

    return weeks
  }

  render() {
    const { date, onChange, theme } = this.props
    const disabledBack = this.isDisabled(this.currentMonth().subtract(1, 'month'), 'months')
    const disabledForward = this.isDisabled(this.currentMonth().add(1, 'month'), 'months')

    return (
      <div className={theme.container}>
        <div className={theme.controls}>
          <MonthNav
            className={css(theme.prevMonth, disabledBack && theme.disabled || undefined)}
            disabled={disabledBack}
            onClick={() => this.setState({ currentMonth: this.currentMonth().subtract(1, 'months').toDate() })}
          />
          <div className={theme.month}>{this.currentMonth().format('MMMM YYYY')}</div>
          <MonthNav
            className={css(theme.nextMonth, disabledForward && theme.disabled || undefined)}
            disabled={disabledForward}
            onClick={() => this.setState({ currentMonth: this.currentMonth().add(1, 'months').toDate() })}
          />
        </div>
        <div className={theme.grid}>
          <div className={theme.heading}>
            {
              moment.weekdaysShort(true).map(d =>
                <DayOfWeek key={d} className={theme.dayOfWeek}>{d}</DayOfWeek>
              )
            }
          </div>
          {
            this.weeks().map((days, i) =>
              <Week key={i} className={theme.week}>
              {
                days.map(d =>
                  <Day
                    key={d.date()}
                    theme={theme}
                    value={d.toDate()}
                    disabled={this.isDisabled(d)}
                    thisMonth={d.month() === this.currentMonth().month()}
                    selected={(typeof date !== 'undefined') && moment(d).isSame(date, 'day')}
                    onSelect={onChange}
                  />
                )
              }
              </Week>
            )
          }
        </div>
      </div>
    )
  }
}

function MonthNav(props: { className: string, disabled: boolean, onClick: () => void }) {
  return (
    <a
      className={props.className}
      onClick={props.disabled ? undefined : props.onClick}
    />
  )
}

function DayOfWeek(props: { className: string, children?: React.ReactChild }) {
  return (
    <div className={props.className}>
    {
      props.children
    }
    </div>
  )
}

type DayProps = {
  value: Date,
  theme: CalendarTheme
  disabled: boolean,
  thisMonth: boolean,
  selected: boolean,
  onSelect: (d: Date) => void
}

function Day(props: DayProps) {
  const { theme } = props

  return (
    <a
      className={
        css(
          props.selected && theme.selected || undefined,
          !props.thisMonth && theme.otherMonthDay || undefined,
          props.disabled && theme.disabled || undefined,
          theme.day
        )
      }
      onClick={props.disabled ? undefined : (() => props.onSelect(props.value))}
    >
      {moment(props.value).date()}
    </a>
  )
}

function Week(props: { className: string, children?: any }) {
  return (
    <div className={props.className}>
    {
      props.children
    }
    </div>
  )
}
