import React, { useState } from 'react';
import {
  Gamepad2,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Users,
  Calendar,
  Layers,
  Sparkles,
  Info,
  Check,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { Game } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/Skeleton';

const GENRE_OPTIONS = [
  { value: 'Tactical Shooter', label: 'Tactical Shooter' },
  { value: 'Battle Royale', label: 'Battle Royale' },
  { value: 'Fighting', label: 'Fighting' },
  { value: 'Sports / Vehicular Soccer', label: 'Sports / Vehicular Soccer' },
  { value: 'MOBA', label: 'MOBA' },
  { value: 'RTS', label: 'Real-Time Strategy' },
  { value: 'Racing', label: 'Racing' },
  { value: 'Card Game', label: 'Collectible Card Game' },
];

const PLATFORM_OPTIONS = [
  { value: 'PC', label: 'PC' },
  { value: 'Cross-Platform', label: 'Cross-Platform' },
  { value: 'PlayStation', label: 'PlayStation' },
  { value: 'Xbox', label: 'Xbox' },
  { value: 'Mobile', label: 'Mobile' },
  { value: 'Nintendo Switch', label: 'Nintendo Switch' },
];

const PASTEL_COLORS = [
  { label: 'Lavender', value: '#8B7CF6' },
  { label: 'Sky Blue', value: '#67B7F7' },
  { label: 'Mint Green', value: '#6FD6B0' },
  { label: 'Peach Coral', value: '#FFAD91' },
  { label: 'Soft Yellow', value: '#FFD978' },
];

export const GamesPage: React.FC = () => {
  const { games, tournaments, loading, createGame, updateGame, deleteGame } = useData();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');

  // Modals & Dialogs State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [viewingGame, setViewingGame] = useState<Game | null>(null);
  const [deletingGame, setDeletingGame] = useState<Game | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formGenre, setFormGenre] = useState('Tactical Shooter');
  const [formPlatform, setFormPlatform] = useState('PC');
  const [formDescription, setFormDescription] = useState('');
  const [formMaxPlayers, setFormMaxPlayers] = useState(5);
  const [formReleaseYear, setFormReleaseYear] = useState(2024);
  const [formBannerColor, setFormBannerColor] = useState('#8B7CF6');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormTitle('');
    setFormGenre('Tactical Shooter');
    setFormPlatform('PC');
    setFormDescription('');
    setFormMaxPlayers(5);
    setFormReleaseYear(2024);
    setFormBannerColor('#8B7CF6');
    setFormErrors({});
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (game: Game) => {
    setEditingGame(game);
    setFormTitle(game.title);
    setFormGenre(game.genre);
    setFormPlatform(game.platform);
    setFormDescription(game.description);
    setFormMaxPlayers(game.max_players_per_team);
    setFormReleaseYear(game.release_year);
    setFormBannerColor(game.banner_color || '#8B7CF6');
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formTitle.trim()) errors.title = 'Game title is required.';
    if (!formGenre) errors.genre = 'Please select a genre.';
    if (!formPlatform) errors.platform = 'Please select a platform.';
    if (!formDescription.trim()) errors.description = 'Game description is required.';
    if (formMaxPlayers < 1 || formMaxPlayers > 64) {
      errors.maxPlayers = 'Players per team must be between 1 and 64.';
    }
    if (formReleaseYear < 1980 || formReleaseYear > 2030) {
      errors.releaseYear = 'Please enter a valid release year (1980-2030).';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        title: formTitle.trim(),
        genre: formGenre,
        platform: formPlatform,
        description: formDescription.trim(),
        max_players_per_team: Number(formMaxPlayers),
        release_year: Number(formReleaseYear),
        banner_color: formBannerColor,
      };

      if (editingGame) {
        await updateGame(editingGame.id, payload);
        showToast('Game updated successfully', {
          message: `"${payload.title}" has been updated.`,
          type: 'success',
        });
        setEditingGame(null);
      } else {
        await createGame(payload);
        showToast('Game added successfully', {
          message: `"${payload.title}" is now available for tournament organization.`,
          type: 'success',
        });
        setIsCreateOpen(false);
      }
      resetForm();
    } catch (err: any) {
      showToast('Error saving game', {
        message: err.message || 'An unexpected error occurred.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingGame) return;
    setIsSubmitting(true);
    try {
      await deleteGame(deletingGame.id);
      showToast('Game deleted', {
        message: `"${deletingGame.title}" has been removed.`,
        type: 'info',
      });
      setDeletingGame(null);
    } catch (err: any) {
      showToast('Error deleting game', {
        message: err.message || 'Unable to delete game.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered List
  const filteredGames = games.filter((g) => {
    const matchesQuery =
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = !selectedGenre || g.genre === selectedGenre;
    const matchesPlatform = !selectedPlatform || g.platform === selectedPlatform;
    return matchesQuery && matchesGenre && matchesPlatform;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#252842] tracking-tight font-heading flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-[#8B7CF6]" />
            Games Management
          </h2>
          <p className="text-xs sm:text-sm text-[#777D96] mt-0.5">
            Configure titles, player formats, and tournament-ready game libraries.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreate}
        >
          Add New Game
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 lg:col-span-6">
            <Input
              placeholder="Search by game title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="sm:col-span-3 lg:col-span-3">
            <Select
              placeholder="All Genres"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              options={GENRE_OPTIONS}
            />
          </div>

          <div className="sm:col-span-3 lg:col-span-3">
            <Select
              placeholder="All Platforms"
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              options={PLATFORM_OPTIONS}
            />
          </div>
        </div>
      </Card>

      {/* Games Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredGames.length === 0 ? (
        <EmptyState
          icon={<Gamepad2 className="w-8 h-8" />}
          title={searchQuery || selectedGenre ? 'No games match your filter' : 'No games added yet'}
          description={
            searchQuery || selectedGenre
              ? 'Try modifying your search keywords or clearing genre/platform filters.'
              : 'Add competitive titles like Valorant, Rocket League, or Street Fighter to build tournaments.'
          }
          actionText={searchQuery || selectedGenre ? 'Clear Filters' : 'Add First Game'}
          onAction={() => {
            if (searchQuery || selectedGenre || selectedPlatform) {
              setSearchQuery('');
              setSelectedGenre('');
              setSelectedPlatform('');
            } else {
              handleOpenCreate();
            }
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGames.map((game) => {
            const tournamentCount = tournaments.filter((t) => t.game_id === game.id).length;

            return (
              <Card
                key={game.id}
                hoverable
                className="overflow-hidden flex flex-col justify-between group p-0 border-[#E9EAF3] hover:shadow-pastel-md transition-all duration-200"
              >
                {/* Banner / Color Accent Strip */}
                <div
                  className="h-24 p-4 flex items-end justify-between relative overflow-hidden"
                  style={{
                    backgroundColor: game.banner_color || '#8B7CF6',
                  }}
                >
                  <div className="absolute inset-0 bg-linear-to-t from-black/45 via-black/10 to-transparent pointer-events-none" />
                  <div className="relative z-10 flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md flex items-center justify-center text-[#252842] shadow-sm">
                      <Gamepad2 className="w-5 h-5 text-[#8B7CF6]" />
                    </div>
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-white px-2 py-0.5 rounded-md bg-black/25 backdrop-blur-xs border border-white/10">
                        {game.genre}
                      </span>
                    </div>
                  </div>

                  <span className="relative z-10 text-[11px] font-bold text-white px-2 py-0.5 rounded-md bg-black/25 backdrop-blur-xs border border-white/10">
                    {game.platform}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-base font-extrabold text-[#252842] group-hover:text-[#8B7CF6] transition-colors font-heading">
                      {game.title}
                    </h3>
                    <p className="text-xs text-[#777D96] line-clamp-2 mt-1.5 leading-relaxed">
                      {game.description}
                    </p>
                  </div>

                  {/* Metadata Row */}
                  <div className="flex items-center justify-between text-xs text-[#777D96] pt-3.5 border-t border-[#E9EAF3]">
                    <div className="flex items-center gap-1.5 font-semibold text-[#252842]">
                      <Users className="w-3.5 h-3.5 text-[#8B7CF6]" />
                      <span>{game.max_players_per_team} per team</span>
                    </div>

                    <div className="flex items-center gap-1.5 font-semibold text-[#8B7CF6] bg-[#F1EEFF] px-2 py-0.5 rounded-md">
                      <Layers className="w-3.5 h-3.5" />
                      <span>{tournamentCount} {tournamentCount === 1 ? 'event' : 'events'}</span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center justify-between gap-2 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Info className="w-3.5 h-3.5" />}
                      onClick={() => setViewingGame(game)}
                    >
                      Details
                    </Button>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                        onClick={() => handleOpenEdit(game)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#FFAD91] hover:text-[#932710] hover:bg-[#FFF2EE]"
                        onClick={() => setDeletingGame(game)}
                        aria-label={`Delete ${game.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Game Modal */}
      <Modal
        isOpen={isCreateOpen || !!editingGame}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingGame(null);
          resetForm();
        }}
        title={editingGame ? `Edit Game: ${editingGame.title}` : 'Add New Game Title'}
        subtitle="Specify competitive rules, team size limits, and platform support."
      >
        <form onSubmit={handleSaveGame} className="space-y-4">
          <Input
            label="Game Title"
            required
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="e.g. Valorant, Rocket League"
            error={formErrors.title}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Genre"
              required
              value={formGenre}
              onChange={(e) => setFormGenre(e.target.value)}
              options={GENRE_OPTIONS}
              error={formErrors.genre}
            />

            <Select
              label="Platform"
              required
              value={formPlatform}
              onChange={(e) => setFormPlatform(e.target.value)}
              options={PLATFORM_OPTIONS}
              error={formErrors.platform}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Max Players per Team"
              type="number"
              min={1}
              max={64}
              required
              value={formMaxPlayers}
              onChange={(e) => setFormMaxPlayers(Number(e.target.value))}
              helperText="e.g. 5 for tactical FPS, 1 for fighting games"
              error={formErrors.maxPlayers}
            />

            <Input
              label="Release Year"
              type="number"
              min={1980}
              max={2030}
              value={formReleaseYear}
              onChange={(e) => setFormReleaseYear(Number(e.target.value))}
              error={formErrors.releaseYear}
            />
          </div>

          <Textarea
            label="Game Description"
            required
            rows={3}
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder="Briefly describe competitive mechanics, objectives, and map structure..."
            error={formErrors.description}
          />

          {/* Banner Pastel Color Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#252842]">
              Theme Accent Color
            </label>
            <div className="flex items-center gap-3">
              {PASTEL_COLORS.map((c) => (
                <button
                  type="button"
                  key={c.value}
                  onClick={() => setFormBannerColor(c.value)}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                    formBannerColor === c.value ? 'ring-2 ring-offset-2 ring-[#8B7CF6] scale-110' : ''
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                >
                  {formBannerColor === c.value && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E9EAF3]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingGame(null);
                resetForm();
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              {editingGame ? 'Save Changes' : 'Create Game'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Game Details View Modal */}
      {viewingGame && (
        <Modal
          isOpen={!!viewingGame}
          onClose={() => setViewingGame(null)}
          title={viewingGame.title}
          subtitle={`Released in ${viewingGame.release_year}`}
        >
          <div className="space-y-4">
            <div
              className="h-28 rounded-2xl p-4 flex items-end justify-between"
              style={{ backgroundColor: viewingGame.banner_color || '#8B7CF6' }}
            >
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-black/30 text-white">
                {viewingGame.genre}
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-black/30 text-white">
                {viewingGame.platform}
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#777D96]">
                About Title
              </h4>
              <p className="text-sm text-[#252842] leading-relaxed">
                {viewingGame.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#F8F9FE] border border-[#E9EAF3] text-xs">
              <div>
                <span className="text-[#777D96]">Roster Format:</span>
                <p className="font-bold text-[#252842] mt-0.5">
                  {viewingGame.max_players_per_team} {viewingGame.max_players_per_team === 1 ? 'player' : 'players'} per team
                </p>
              </div>
              <div>
                <span className="text-[#777D96]">Platform Standard:</span>
                <p className="font-bold text-[#252842] mt-0.5">{viewingGame.platform}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E9EAF3]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewingGame(null)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                onClick={() => {
                  const g = viewingGame;
                  setViewingGame(null);
                  handleOpenEdit(g);
                }}
              >
                Edit Game
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingGame}
        onClose={() => setDeletingGame(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Game Title"
        message={`Are you sure you want to delete "${deletingGame?.title}"? Any linked tournaments will be archived.`}
        confirmText="Confirm Delete"
        isLoading={isSubmitting}
      />
    </div>
  );
};
