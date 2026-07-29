import { StaffRole } from '../types';
import {
  STAFF_TEMPLATES,
  EDITOR_PERKS,
  MODERATOR_PERKS,
  MANAGER_PERKS,
  generateStaffCandidate,
  generateHiringPool,
  generateRoleSpecificPool,
  refreshHiringPool,
  getStaffEffectValue,
  getStaffByRole,
  calculateTotalSalaries,
  getAverageSkillByRole,
  getRoleDisplayName,
  getRoleDescription,
} from './staff';

describe('Staff Templates', () => {
  it('should have templates for all staff roles', () => {
    expect(STAFF_TEMPLATES[StaffRole.Editor]).toBeDefined();
    expect(STAFF_TEMPLATES[StaffRole.Moderator]).toBeDefined();
    expect(STAFF_TEMPLATES[StaffRole.Manager]).toBeDefined();
  });

  it('should have editors with moderate salary', () => {
    const template = STAFF_TEMPLATES[StaffRole.Editor];
    expect(template.baseSalary).toBe(500);
  });

  it('should have moderators with lowest salary', () => {
    const template = STAFF_TEMPLATES[StaffRole.Moderator];
    expect(template.baseSalary).toBe(200);
  });

  it('should have managers with highest salary', () => {
    const template = STAFF_TEMPLATES[StaffRole.Manager];
    expect(template.baseSalary).toBe(800);
  });
});

describe('Staff Perks', () => {
  it('should have editor perks for content prep time', () => {
    const prepTimePerk = EDITOR_PERKS.find(
      (p) => p.effect.contentPrepTimeReduction !== undefined
    );
    expect(prepTimePerk).toBeDefined();
    expect(prepTimePerk!.effect.contentPrepTimeReduction).toBeGreaterThan(0);
  });

  it('should have moderator perks for chat health', () => {
    const chatPerk = MODERATOR_PERKS.find(
      (p) => p.effect.chatHealthBonus !== undefined
    );
    expect(chatPerk).toBeDefined();
    expect(chatPerk!.effect.chatHealthBonus).toBeGreaterThan(0);
  });

  it('should have manager perks for brand deals', () => {
    const dealPerk = MANAGER_PERKS.find(
      (p) => p.effect.brandDealPayoutBonus !== undefined
    );
    expect(dealPerk).toBeDefined();
    expect(dealPerk!.effect.brandDealPayoutBonus).toBeGreaterThan(0);
  });
});

describe('generateStaffCandidate', () => {
  it('should generate a staff member with correct role', () => {
    const editor = generateStaffCandidate(StaffRole.Editor);
    expect(editor.role).toBe(StaffRole.Editor);
  });

  it('should generate a staff member with valid skill range', () => {
    const staff = generateStaffCandidate(StaffRole.Moderator);
    expect(staff.skill).toBeGreaterThanOrEqual(1);
    expect(staff.skill).toBeLessThanOrEqual(10);
  });

  it('should generate a staff member with a name', () => {
    const staff = generateStaffCandidate(StaffRole.Manager);
    expect(staff.name).toBeTruthy();
    expect(staff.name.split(' ').length).toBe(2);
  });

  it('should generate a staff member with a positive salary', () => {
    const staff = generateStaffCandidate(StaffRole.Editor);
    expect(staff.salary).toBeGreaterThan(0);
  });

  it('should generate unique IDs for each staff member', () => {
    const staff1 = generateStaffCandidate(StaffRole.Editor);
    const staff2 = generateStaffCandidate(StaffRole.Editor);
    expect(staff1.id).not.toBe(staff2.id);
  });
});

describe('generateHiringPool', () => {
  it('should generate a pool with the specified size', () => {
    const pool = generateHiringPool(6);
    expect(pool.length).toBe(6);
  });

  it('should include staff from multiple roles', () => {
    const pool = generateHiringPool(9);
    const roles = new Set(pool.map((s) => s.role));
    expect(roles.size).toBeGreaterThanOrEqual(2);
  });

  it('should generate a default pool of 6', () => {
    const pool = generateHiringPool();
    expect(pool.length).toBe(6);
  });
});

describe('generateRoleSpecificPool', () => {
  it('should generate only staff of the specified role', () => {
    const pool = generateRoleSpecificPool(StaffRole.Editor, 5);
    expect(pool.length).toBe(5);
    expect(pool.every((s) => s.role === StaffRole.Editor)).toBe(true);
  });
});

describe('refreshHiringPool', () => {
  it('should keep some existing candidates and add new ones', () => {
    const originalPool = generateHiringPool(6);
    const originalIds = new Set(originalPool.map((s) => s.id));

    const refreshedPool = refreshHiringPool(originalPool, 2);
    expect(refreshedPool.length).toBe(6);

    const keptCount = refreshedPool.filter((s) => originalIds.has(s.id)).length;
    expect(keptCount).toBe(4);
  });
});

describe('getStaffEffectValue', () => {
  it('should calculate total effect value from staff perks', () => {
    const staff = [
      {
        id: '1',
        name: 'Test Editor',
        role: StaffRole.Editor,
        salary: 500,
        skill: 5,
        perks: [
          {
            id: 'test_perk',
            name: 'Test',
            description: 'Test perk',
            effect: { contentPrepTimeReduction: 0.2 },
          },
        ],
        hiredAt: Date.now(),
      },
    ];

    const value = getStaffEffectValue(staff, 'contentPrepTimeReduction');
    expect(value).toBe(0.2);
  });

  it('should sum effects from multiple staff', () => {
    const staff = [
      {
        id: '1',
        name: 'Editor 1',
        role: StaffRole.Editor,
        salary: 500,
        skill: 5,
        perks: [
          {
            id: 'perk1',
            name: 'Test 1',
            description: 'Test',
            effect: { contentPrepTimeReduction: 0.1 },
          },
        ],
        hiredAt: Date.now(),
      },
      {
        id: '2',
        name: 'Editor 2',
        role: StaffRole.Editor,
        salary: 600,
        skill: 7,
        perks: [
          {
            id: 'perk2',
            name: 'Test 2',
            description: 'Test',
            effect: { contentPrepTimeReduction: 0.15 },
          },
        ],
        hiredAt: Date.now(),
      },
    ];

    const value = getStaffEffectValue(staff, 'contentPrepTimeReduction');
    expect(value).toBeCloseTo(0.25);
  });
});

describe('getStaffByRole', () => {
  it('should filter staff by role', () => {
    const staff = [
      generateStaffCandidate(StaffRole.Editor),
      generateStaffCandidate(StaffRole.Moderator),
      generateStaffCandidate(StaffRole.Editor),
    ];

    const editors = getStaffByRole(staff, StaffRole.Editor);
    expect(editors.length).toBe(2);
    expect(editors.every((s) => s.role === StaffRole.Editor)).toBe(true);
  });
});

describe('calculateTotalSalaries', () => {
  it('should sum all staff salaries', () => {
    const staff = [
      { ...generateStaffCandidate(StaffRole.Editor), salary: 500 },
      { ...generateStaffCandidate(StaffRole.Moderator), salary: 200 },
    ];

    const total = calculateTotalSalaries(staff);
    expect(total).toBe(700);
  });
});

describe('getAverageSkillByRole', () => {
  it('should calculate average skill for a role', () => {
    const staff = [
      { ...generateStaffCandidate(StaffRole.Editor), skill: 4 },
      { ...generateStaffCandidate(StaffRole.Editor), skill: 8 },
      { ...generateStaffCandidate(StaffRole.Moderator), skill: 10 },
    ];

    const avgEditorSkill = getAverageSkillByRole(staff, StaffRole.Editor);
    expect(avgEditorSkill).toBe(6);
  });

  it('should return 0 for roles with no staff', () => {
    const staff = [generateStaffCandidate(StaffRole.Editor)];
    const avgManagerSkill = getAverageSkillByRole(staff, StaffRole.Manager);
    expect(avgManagerSkill).toBe(0);
  });
});

describe('getRoleDisplayName', () => {
  it('should return human-readable role names', () => {
    expect(getRoleDisplayName(StaffRole.Editor)).toBe('Editor');
    expect(getRoleDisplayName(StaffRole.Moderator)).toBe('Moderator');
    expect(getRoleDisplayName(StaffRole.Manager)).toBe('Manager');
  });
});

describe('getRoleDescription', () => {
  it('should return descriptions for each role', () => {
    expect(getRoleDescription(StaffRole.Editor)).toContain('content prep');
    expect(getRoleDescription(StaffRole.Moderator)).toContain('chat health');
    expect(getRoleDescription(StaffRole.Manager)).toContain('brand deals');
  });
});
