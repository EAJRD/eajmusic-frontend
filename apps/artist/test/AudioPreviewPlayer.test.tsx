import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AudioPreviewPlayer } from '../components/AudioPreviewPlayer';
import './setup';

describe('AudioPreviewPlayer Component (Dark System)', () => {
  const dummyAudio = 'https://example.com/test-audio.mp3';

  it('renders audio player with track title and artist', () => {
    render(
      <AudioPreviewPlayer
        src={dummyAudio}
        trackTitle="Test Track"
        artistName="EAJ Artist"
      />
    );

    expect(screen.getByText('Test Track')).toBeDefined();
    expect(screen.getByText('EAJ Artist')).toBeDefined();
    expect(screen.getByLabelText(/reproducir|play/i)).toBeDefined();
  });

  it('toggles play/pause state when clicking the main button', async () => {
    render(
      <AudioPreviewPlayer
        src={dummyAudio}
        trackTitle="Hit Single"
      />
    );

    const playButton = screen.getByLabelText(/reproducir|play/i);
    fireEvent.click(playButton);

    expect(screen.getByLabelText(/pausar|pause/i)).toBeDefined();

    fireEvent.click(screen.getByLabelText(/pausar|pause/i));
    expect(screen.getByLabelText(/reproducir|play/i)).toBeDefined();
  });

  it('allows seeking via progress slider', () => {
    render(
      <AudioPreviewPlayer
        src={dummyAudio}
        trackTitle="Hit Single"
      />
    );

    const slider = screen.getByRole('slider', { name: /progreso|progress/i });
    expect(slider).toBeDefined();
    fireEvent.change(slider, { target: { value: '50' } });
    expect((slider as HTMLInputElement).value).toBe('50');
  });

  it('handles volume and mute toggling', () => {
    render(
      <AudioPreviewPlayer
        src={dummyAudio}
        trackTitle="Hit Single"
      />
    );

    const muteBtn = screen.getByLabelText(/silenciar volumen/i);
    expect(muteBtn).toBeDefined();
    fireEvent.click(muteBtn);
    expect(screen.getByLabelText(/activar volumen/i)).toBeDefined();
  });
});
