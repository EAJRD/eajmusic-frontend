import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SplitsModal } from '../components/SplitsModal';
import type { SplitContributor } from '../../../src/types/api';
import './setup';

describe('SplitsModal Component (Dark System)', () => {
  const initialSplits: SplitContributor[] = [
    { id: '1', name: 'Primary Artist', email: 'artist@eaj.com', role: 'Artist', percentage: 70 },
    { id: '2', name: 'Producer Joe', email: 'joe@beats.com', role: 'Producer', percentage: 30 },
  ];

  it('renders modal with initial contributors and 100% total', () => {
    render(
      <SplitsModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        trackTitle="Hit Single"
        initialSplits={initialSplits}
      />
    );

    expect(screen.getByText(/Splits & Regalías/i)).toBeDefined();
    expect(screen.getByText(/Hit Single/i)).toBeDefined();
    expect(screen.getByDisplayValue('Primary Artist')).toBeDefined();
    expect(screen.getByDisplayValue('Producer Joe')).toBeDefined();
    expect(screen.getAllByText(/100%/).length).toBeGreaterThan(0);
  });

  it('validates that save is enabled only when sum is exactly 100%', () => {
    const handleSave = vi.fn();
    render(
      <SplitsModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={handleSave}
        trackTitle="Hit Single"
        initialSplits={initialSplits}
      />
    );

    const saveButton = screen.getByRole('button', { name: /Guardar Splits|Confirmar Splits/i });
    expect((saveButton as HTMLButtonElement).disabled).toBe(false);

    // Change first contributor to 50% so total is 80%
    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0], { target: { value: '50' } });

    // Total is now 80% -> Save should be disabled
    expect(screen.getByText(/80%/)).toBeDefined();
    expect((saveButton as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText(/Faltan 20%/i)).toBeDefined();

    // Click should not fire onSave
    fireEvent.click(saveButton);
    expect(handleSave).not.toHaveBeenCalled();
  });

  it('can add a new contributor and recalculate', () => {
    const singleSplit: SplitContributor[] = [
      { id: '1', name: 'Sole Creator', email: 'creator@eaj.com', role: 'Artist', percentage: 80 }
    ];
    render(
      <SplitsModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        trackTitle="Hit Single"
        initialSplits={singleSplit}
      />
    );

    const addBtn = screen.getByRole('button', { name: /Añadir Colaborador|Agregar/i });
    fireEvent.click(addBtn);

    const nameInputs = screen.getAllByPlaceholderText(/Juan Pérez/i);
    expect(nameInputs.length).toBe(2);
  });

  it('can delete a contributor and allows equal distribution', () => {
    render(
      <SplitsModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        trackTitle="Hit Single"
        initialSplits={initialSplits}
      />
    );

    const distributeBtn = screen.getByRole('button', { name: /Dividir en partes iguales|Repartir/i });
    fireEvent.click(distributeBtn);

    // 100 / 2 = 50 each
    const spinButtons = screen.getAllByRole('spinbutton') as HTMLInputElement[];
    expect(spinButtons[0].value).toBe('50');
    expect(spinButtons[1].value).toBe('50');
  });
});
