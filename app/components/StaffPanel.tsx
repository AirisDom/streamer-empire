'use client';

import { useState, useEffect } from 'react';
import { useGameStore, GameStore } from '../store/gameStore';
import { Staff, StaffRole } from '../types';
import {
  generateHiringPool,
  getRoleDisplayName,
  getRoleDescription,
  calculateTotalSalaries,
} from '../data/staff';

interface StaffPanelProps {
  onClose: () => void;
}

const ROLE_ICONS: Record<StaffRole, string> = {
  [StaffRole.Editor]: '✂️',
  [StaffRole.Moderator]: '🛡️',
  [StaffRole.Manager]: '💼',
  [StaffRole.Designer]: '🎨',
};

const SKILL_COLORS: Record<number, string> = {
  1: 'text-zinc-400',
  2: 'text-zinc-400',
  3: 'text-green-400',
  4: 'text-green-400',
  5: 'text-blue-400',
  6: 'text-blue-400',
  7: 'text-purple-400',
  8: 'text-purple-400',
  9: 'text-amber-400',
  10: 'text-amber-400',
};

function getSkillLabel(skill: number): string {
  if (skill >= 9) return 'Expert';
  if (skill >= 7) return 'Advanced';
  if (skill >= 5) return 'Intermediate';
  if (skill >= 3) return 'Basic';
  return 'Novice';
}

export default function StaffPanel({ onClose }: StaffPanelProps) {
  const [activeTab, setActiveTab] = useState<'roster' | 'hire'>('roster');
  const [candidates, setCandidates] = useState<Staff[]>([]);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'hire' | 'fire';
    staff: Staff;
  } | null>(null);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const player = useGameStore((state: GameStore) => state.player);
  const hireStaff = useGameStore((state: GameStore) => state.hireStaff);
  const fireStaff = useGameStore((state: GameStore) => state.fireStaff);
  const updateCurrency = useGameStore((state: GameStore) => state.updateCurrency);

  const currentStaff = player.channel.staff;
  const weeklyPayroll = calculateTotalSalaries(currentStaff);

  useEffect(() => {
    setCandidates(generateHiringPool(6));
  }, []);

  const showMessage = (text: string, isError: boolean = false) => {
    setMessage({ text, isError });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleHireConfirm = (staff: Staff) => {
    if (player.money < staff.salary) {
      showMessage("Not enough money to cover first week's salary!", true);
      return;
    }
    updateCurrency(-staff.salary);
    hireStaff(staff);
    setCandidates((prev) => prev.filter((c) => c.id !== staff.id));
    setConfirmAction(null);
    showMessage(`Hired ${staff.name} as ${getRoleDisplayName(staff.role)}!`);
  };

  const handleFireConfirm = (staff: Staff) => {
    fireStaff(staff.id);
    setConfirmAction(null);
    showMessage(`${staff.name} has been let go.`);
  };

  const refreshCandidates = () => {
    setCandidates(generateHiringPool(6));
    showMessage('New candidates available!');
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-zinc-700 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Staff Management</h2>
              <p className="text-zinc-400 mt-1">
                Weekly Payroll:{' '}
                <span className={weeklyPayroll > 0 ? 'text-red-400 font-semibold' : 'text-zinc-400'}>
                  ${weeklyPayroll.toLocaleString()}/week
                </span>
                <span className="mx-2">•</span>
                Balance:{' '}
                <span className="text-green-400 font-semibold">${player.money.toLocaleString()}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {message && (
            <div
              className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium ${
                message.isError ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
              }`}
            >
              {message.text}
            </div>
          )}
        </div>

        <div className="border-b border-zinc-700 px-6 shrink-0">
          <div className="flex gap-4">
            <TabButton
              label="Current Roster"
              count={currentStaff.length}
              active={activeTab === 'roster'}
              onClick={() => setActiveTab('roster')}
            />
            <TabButton
              label="Hire New Staff"
              count={candidates.length}
              active={activeTab === 'hire'}
              onClick={() => setActiveTab('hire')}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'roster' && (
            <div>
              {currentStaff.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">👥</div>
                  <p className="text-zinc-400 text-lg">No staff hired yet</p>
                  <p className="text-zinc-500 text-sm mt-1">
                    Check out the hiring tab to build your team
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentStaff.map((member: Staff) => (
                    <StaffCard
                      key={member.id}
                      staff={member}
                      isHired
                      onAction={() => setConfirmAction({ type: 'fire', staff: member })}
                      canAfford
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'hire' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-zinc-400 text-sm">
                  Candidates refresh each week or manually for a fee
                </p>
                <button
                  onClick={refreshCandidates}
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Refresh Candidates
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {candidates.map((candidate) => (
                  <StaffCard
                    key={candidate.id}
                    staff={candidate}
                    isHired={false}
                    onAction={() => setConfirmAction({ type: 'hire', staff: candidate })}
                    canAfford={player.money >= candidate.salary}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-zinc-700 shrink-0">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <div className="flex items-center gap-4">
              {Object.values(StaffRole).map((role) => {
                const count = currentStaff.filter((s: Staff) => s.role === role).length;
                return (
                  <span key={role} className="flex items-center gap-1">
                    <span>{ROLE_ICONS[role]}</span>
                    <span>{getRoleDisplayName(role)}:</span>
                    <span className="text-zinc-300">{count}</span>
                  </span>
                );
              })}
            </div>
            <span>Total Staff: {currentStaff.length}</span>
          </div>
        </div>
      </div>

      {confirmAction && (
        <ConfirmDialog
          type={confirmAction.type}
          staff={confirmAction.staff}
          onConfirm={() =>
            confirmAction.type === 'hire'
              ? handleHireConfirm(confirmAction.staff)
              : handleFireConfirm(confirmAction.staff)
          }
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}

interface TabButtonProps {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}

function TabButton({ label, count, active, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
        active
          ? 'text-purple-400 border-purple-400'
          : 'text-zinc-400 border-transparent hover:text-zinc-300'
      }`}
    >
      {label}
      <span
        className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
          active ? 'bg-purple-500/20 text-purple-400' : 'bg-zinc-700 text-zinc-400'
        }`}
      >
        {count}
      </span>
    </button>
  );
}

interface StaffCardProps {
  staff: Staff;
  isHired: boolean;
  onAction: () => void;
  canAfford: boolean;
}

function StaffCard({ staff, isHired, onAction, canAfford }: StaffCardProps) {
  const skillColor = SKILL_COLORS[staff.skill] || 'text-zinc-400';
  const skillLabel = getSkillLabel(staff.skill);

  return (
    <div
      className={`p-4 rounded-xl border-2 transition-all ${
        isHired
          ? 'border-green-500/30 bg-green-500/5'
          : canAfford
          ? 'border-zinc-600 bg-zinc-700/30 hover:border-purple-500/50'
          : 'border-zinc-700 bg-zinc-800/50 opacity-60'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-xl">
            {ROLE_ICONS[staff.role]}
          </div>
          <div>
            <h4 className="font-semibold text-white">{staff.name}</h4>
            <p className="text-sm text-zinc-400">{getRoleDisplayName(staff.role)}</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-sm font-semibold ${skillColor}`}>
            {skillLabel}
          </div>
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <span>Skill:</span>
            <span className={skillColor}>{staff.skill}/10</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-zinc-500 mb-3">{getRoleDescription(staff.role)}</p>

      {staff.perks.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-zinc-500 mb-1.5">Perks:</div>
          <div className="flex flex-wrap gap-1.5">
            {staff.perks.map((perk) => (
              <span
                key={perk.id}
                className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded-full"
                title={perk.description}
              >
                {perk.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-zinc-700">
        <div>
          <span className="text-zinc-500 text-xs">Salary: </span>
          <span className="text-amber-400 font-semibold">${staff.salary}/week</span>
        </div>
        {isHired ? (
          <button
            onClick={onAction}
            className="px-4 py-1.5 text-sm font-medium bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
          >
            Fire
          </button>
        ) : canAfford ? (
          <button
            onClick={onAction}
            className="px-4 py-1.5 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors"
          >
            Hire
          </button>
        ) : (
          <span className="text-xs text-red-400">Can&apos;t afford</span>
        )}
      </div>
    </div>
  );
}

interface ConfirmDialogProps {
  type: 'hire' | 'fire';
  staff: Staff;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({ type, staff, onConfirm, onCancel }: ConfirmDialogProps) {
  const isHire = type === 'hire';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
      <div className="bg-zinc-800 rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 border border-zinc-700">
        <h3 className="text-xl font-bold text-white mb-2">
          {isHire ? 'Confirm Hire' : 'Confirm Termination'}
        </h3>
        <p className="text-zinc-400 mb-4">
          {isHire ? (
            <>
              Hire <span className="text-white font-medium">{staff.name}</span> as{' '}
              <span className="text-white font-medium">{getRoleDisplayName(staff.role)}</span>?
              <br />
              <span className="text-sm">
                You&apos;ll pay <span className="text-amber-400">${staff.salary}</span> immediately
                for their first week.
              </span>
            </>
          ) : (
            <>
              Are you sure you want to let{' '}
              <span className="text-white font-medium">{staff.name}</span> go?
              <br />
              <span className="text-sm text-zinc-500">
                This will save you ${staff.salary}/week in payroll.
              </span>
            </>
          )}
        </p>

        {isHire && staff.perks.length > 0 && (
          <div className="mb-4 p-3 bg-zinc-700/50 rounded-lg">
            <div className="text-xs text-zinc-400 mb-2">This hire will bring:</div>
            <ul className="space-y-1">
              {staff.perks.map((perk) => (
                <li key={perk.id} className="text-sm text-purple-300">
                  • {perk.name}: {perk.description}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              isHire
                ? 'bg-green-600 text-white hover:bg-green-500'
                : 'bg-red-600 text-white hover:bg-red-500'
            }`}
          >
            {isHire ? 'Hire' : 'Fire'}
          </button>
        </div>
      </div>
    </div>
  );
}
