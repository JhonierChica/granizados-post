-- Indexes for cash_register_closes performance
CREATE INDEX IF NOT EXISTS idx_cash_register_closes_closing_date ON cash_register_closes(closing_date DESC);
CREATE INDEX IF NOT EXISTS idx_cash_register_closes_closed_by ON cash_register_closes(closed_by);
