import {
    academicNamesMatch,
    licenseBatchCovers,
    licenseScopeAllowsBranch,
    licenseScopeAllowsDegree,
} from '../academicHierarchy'

describe('license academic matching', () => {
    it('matches B.Tech aliases to Bachelor of Technology', () => {
        expect(academicNamesMatch('B.Tech', 'Bachelor of Technology')).toBe(true)
        expect(academicNamesMatch('Bachelor of Technology (B.Tech)', 'Bachelor of Technology')).toBe(true)
        expect(licenseScopeAllowsDegree(['B.Tech'], 'Bachelor of Technology')).toBe(true)
        expect(licenseScopeAllowsDegree('B.Tech', 'Bachelor of Technology')).toBe(true)
    })

    it('matches CSE and IT abbreviations to full branch names', () => {
        expect(academicNamesMatch('CSE', 'Computer Science Engineering (CSE)')).toBe(true)
        expect(academicNamesMatch('IT', 'Information Technology (IT)')).toBe(true)
        expect(licenseScopeAllowsBranch(['CSE', 'IT'], 'Computer Science Engineering (CSE)')).toBe(true)
        expect(licenseScopeAllowsBranch(['CSE', 'IT'], 'Information Technology (IT)')).toBe(true)
    })

    it('does not match a licensed CSE branch to IT', () => {
        expect(licenseScopeAllowsBranch(['CSE'], 'Information Technology (IT)')).toBe(false)
        expect(academicNamesMatch('CSE', 'Information Technology (IT)')).toBe(false)
    })

    it('does not match B.Tech to B.E.', () => {
        expect(academicNamesMatch('B.Tech', 'Bachelor of Engineering')).toBe(false)
        expect(licenseScopeAllowsDegree(['B.Tech'], 'Bachelor of Engineering')).toBe(false)
    })

    it('treats empty license degree/branch as unrestricted', () => {
        expect(licenseScopeAllowsDegree([], 'Bachelor of Technology')).toBe(true)
        expect(licenseScopeAllowsDegree(null, 'Bachelor of Technology')).toBe(true)
        expect(licenseScopeAllowsBranch([], 'Computer Science Engineering (CSE)')).toBe(true)
    })

    it('covers graduation years inside a license batch range', () => {
        expect(licenseBatchCovers('2026-2030', '2027')).toBe(true)
        expect(licenseBatchCovers('2026-2030', '2026')).toBe(true)
        expect(licenseBatchCovers('2026-2030', '2030')).toBe(true)
        expect(licenseBatchCovers('2026–2030', '2028')).toBe(true)
        expect(licenseBatchCovers('2027', '2027')).toBe(true)
        expect(licenseBatchCovers('2026-2030', '2026-2030')).toBe(true)
    })

    it('does not cover years outside the licensed batch', () => {
        expect(licenseBatchCovers('2026-2030', '2025')).toBe(false)
        expect(licenseBatchCovers('2026-2030', '2031')).toBe(false)
        expect(licenseBatchCovers('2026', '2027')).toBe(false)
        expect(licenseBatchCovers('2025-A', '2025')).toBe(false)
    })
})
