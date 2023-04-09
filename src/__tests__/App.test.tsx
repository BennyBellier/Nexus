import React from 'react';
import '@testing-library/jest-dom';
import { render, fireEvent } from '@testing-library/react';
import Match from '../renderer/pages/Match';

describe('Match component', () => {
  let component: any;
  let mockTimeUpdated: jest.Mock<any, any>;
  const mockMatch = {
    timeUpdated: jest.fn(),
    startStop: jest.fn(),
    scoreUpdated: jest.fn(),
    nextRound: jest.fn(),
    loaded: jest.fn(),
    init: jest.fn(),
  };
  window.match = mockMatch;
  const mockNexus = {
    getAssetsPath: jest.fn(),
    descriptionUpdated: jest.fn(),
    tcp_ip: jest.fn(),
    tcp_clientsUpdated: jest.fn(),
  };
  window.nexus = mockNexus;

  beforeEach(() => {
    component = render(<Match />);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders the component', () => {
    window.match.timeUpdated(mockTimeUpdated, true);
    expect(component.container).toMatchSnapshot();
  });

  it('renders the create button', () => {
    const button = component.getByText('Nouveau match');
    expect(button).toBeInTheDocument();
  });

  it('renders the QR code button', () => {
    const button = component.getByText('Afficher le QR code');
    expect(button).toBeInTheDocument();
  });

  it('renders the correction button', () => {
    const checkbox = component.getByRole('switch');
    expect(checkbox).toBeInTheDocument();
  });

  it('clicks the start/stop button', () => {
    // Find the button by its ID
    const startStopButton = component.getByTestId('start-stop-timer');

    // Mock the startStop function
    const mockStartStop = jest.fn();
    window.match.startStop = mockStartStop;

    // Click the button
    fireEvent.click(startStopButton);

    // Check that the startStop function was called
    expect(mockStartStop).toHaveBeenCalled();
  });

  it('calls timeUpdated when the match time is updated', () => {
    mockTimeUpdated = jest.fn();
    expect(mockTimeUpdated).not.toHaveBeenCalled();
    // Simuler la réponse de la fonction timeUpdated
    window.match.timeUpdated((time: number, percentage: number) => {
      mockTimeUpdated(time, percentage);
    });

    // Ajouter un délai pour laisser le temps à la simulation de s'exécuter
    setTimeout(() => {
      // Vérifier que la fonction timeUpdated est appelée
      expect(mockTimeUpdated).toHaveBeenCalledWith(1000, 50);
    }, 100);
  });
});
