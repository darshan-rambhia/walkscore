import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MapView from '../../components/MapView';
import type { Amenity } from '../../services/location';

// Mock Leaflet and react-leaflet
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children, center, zoom, ...props }: any) => (
    <div data-testid="map-container" data-center={center} data-zoom={zoom} {...props}>
      {children}
    </div>
  ),
  TileLayer: (props: any) => <div data-testid="tile-layer" {...props} />,
  Marker: ({ children, position, ...props }: any) => (
    <div data-testid="marker" data-position={position} {...props}>
      {children}
    </div>
  ),
  Popup: ({ children, ...props }: any) => (
    <div data-testid="popup" {...props}>
      {children}
    </div>
  ),
}));

vi.mock('leaflet', () => ({
  Icon: vi.fn().mockImplementation((options) => ({ ...options, _mock: true })),
}));

describe('MapView', () => {
  const mockCenter = { lat: 40.7580, lon: -73.9855 };
  const mockAmenities: Amenity[] = [
    {
      id: '1',
      name: 'Test Restaurant',
      type: 'restaurant',
      lat: 40.7590,
      lon: -73.9865,
      distance: 500
    },
    {
      id: '2',
      name: 'Test Cafe',
      type: 'cafe',
      lat: 40.7570,
      lon: -73.9845,
      distance: 300
    }
  ];

  it('should render map container with correct props', () => {
    render(<MapView center={mockCenter} amenities={[]} />);
    
    const mapContainer = screen.getByTestId('map-container');
    expect(mapContainer).toBeInTheDocument();
    expect(mapContainer).toHaveAttribute('data-zoom', '16');
  });

  it('should render tile layer', () => {
    render(<MapView center={mockCenter} amenities={[]} />);
    
    expect(screen.getByTestId('tile-layer')).toBeInTheDocument();
  });

  it('should render center marker', () => {
    render(<MapView center={mockCenter} amenities={[]} />);
    
    const markers = screen.getAllByTestId('marker');
    expect(markers).toHaveLength(1);
  });

  it('should render amenity markers', () => {
    render(<MapView center={mockCenter} amenities={mockAmenities} />);
    
    const markers = screen.getAllByTestId('marker');
    expect(markers).toHaveLength(3); // Center marker + 2 amenity markers
  });

  it('should render popups', () => {
    render(<MapView center={mockCenter} amenities={mockAmenities} />);
    
    const popups = screen.getAllByTestId('popup');
    expect(popups).toHaveLength(3); // Center + 2 amenity popups
  });

  it('should handle empty amenities array', () => {
    render(<MapView center={mockCenter} amenities={[]} />);
    
    const markers = screen.getAllByTestId('marker');
    expect(markers).toHaveLength(1); // Only center marker
  });

  it('should handle display name prop', () => {
    const displayName = 'New York, NY';
    render(<MapView center={mockCenter} amenities={[]} displayName={displayName} />);
    
    // Component should render without errors
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  it('should render correct number of amenities', () => {
    const manyAmenities: Amenity[] = Array.from({ length: 5 }, (_, i) => ({
      id: String(i),
      name: `Amenity ${i}`,
      type: 'restaurant',
      lat: 40.7580 + i * 0.001,
      lon: -73.9855 + i * 0.001,
      distance: 100 + i * 50
    }));

    render(<MapView center={mockCenter} amenities={manyAmenities} />);
    
    const markers = screen.getAllByTestId('marker');
    expect(markers).toHaveLength(6); // Center marker + 5 amenity markers
  });
});