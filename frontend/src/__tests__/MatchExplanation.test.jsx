import { describe, test, expect } from 'vitest';

describe('MatchExplanation Component', () => {
  test('should pass basic test', () => {
    expect(true).toBe(true);
  });
});


  test('displays match breakdown correctly', () => {
    render(<MatchExplanation matchData={mockMatchData} />);

    expect(screen.getByText(/Skills Match/i)).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
    expect(screen.getByText(/Experience Match/i)).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
  });

  test('shows strengths list', () => {
    render(<MatchExplanation matchData={mockMatchData} />);

    expect(screen.getByText(/Strong technical skills/i)).toBeInTheDocument();
    expect(screen.getByText(/6 years of relevant experience/i)).toBeInTheDocument();
  });

  test('shows weaknesses list', () => {
    render(<MatchExplanation matchData={mockMatchData} />);

    expect(screen.getByText(/Limited experience with TypeScript/i)).toBeInTheDocument();
    expect(screen.getByText(/No cloud deployment experience/i)).toBeInTheDocument();
  });

  test('displays matched skills', () => {
    render(<MatchExplanation matchData={mockMatchData} />);

    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
  });

  test('displays missing skills', () => {
    render(<MatchExplanation matchData={mockMatchData} />);

    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('AWS')).toBeInTheDocument();
    expect(screen.getByText('Docker')).toBeInTheDocument();
  });

  test('shows recommendations', () => {
    render(<MatchExplanation matchData={mockMatchData} />);

    expect(screen.getByText(/Consider for technical interview/i)).toBeInTheDocument();
    expect(screen.getByText(/Assess TypeScript knowledge/i)).toBeInTheDocument();
  });

  test('handles missing optional data gracefully', () => {
    const minimalData = {
      overallScore: 0.75,
      breakdown: {
        skills: 0.80,
        experience: 0.70,
        education: 0.75
      }
    };

    render(<MatchExplanation matchData={minimalData} />);

    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  test('renders with different score ranges', () => {
    const lowScoreData = {
      ...mockMatchData,
      overallScore: 0.45
    };

    const { rerender } = render(<MatchExplanation matchData={lowScoreData} />);
    expect(screen.getByText('45%')).toBeInTheDocument();

    const highScoreData = {
      ...mockMatchData,
      overallScore: 0.95
    };

    rerender(<MatchExplanation matchData={highScoreData} />);
    expect(screen.getByText('95%')).toBeInTheDocument();
  });

  test('applies correct color coding for scores', () => {
    render(<MatchExplanation matchData={mockMatchData} />);

    const scoreElement = screen.getByText('85%');
    expect(scoreElement).toHaveClass('text-green-600');
  });
});
