import { createHash } from 'node:crypto';

export namespace GithubBranchUtils {

    export function normalizeTitleForBranch(title: string): string {
        const withoutAccents = title.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        let result = withoutAccents.toLowerCase();

        result = result.replace(/[\s~^:?*\[\\]/g, '-');

        result = result.replace(/@\{/g, '-');

        result = result.replace(/\.{2,}/g, '.').replace(/\/{2,}/g, '/');

        result = result.replace(/\//g, '-');

        result = result.replace(/[^a-z0-9.-]/g, '-').replace(/-{2,}/g, '-');

        result = result.replace(/^[-.]+|[-.]+$/g, '');

        return result;
    }

    export function generateBranchName(ticketKey: string, title: string): string {
        const normalizedTitle = normalizeTitleForBranch(title);
        return `${ticketKey.toLowerCase()}-${normalizedTitle}`;
    }

    export function generateBranchHash(branchName: string): string {
        const clean = branchName.replace(/\r?\n/g, '');
        const hex = createHash('sha256').update(clean, 'utf8').digest('hex');
        return hex.substring(0, 30);
    }

    export function buildTestSubdomain(branchName: string): string {
        const hash = generateBranchHash(branchName);
        const label = `r${hash}`.toLowerCase();
        // Par sûreté, garder seulement [a-z0-9-], et s’assurer pas de '-' en bord
        const safe = label.replace(/[^a-z0-9-]/g, '').replace(/^-+|-+$/g, '');
        // Garantir <= 63 chars (notre 31 est déjà OK)
        return safe.slice(0, 63);
    }

    export function buildTestLinkFromBranch(branchName: string): string {
        const sub = buildTestSubdomain(branchName);
        return `https://${sub}.test.repairsoft.fr/`;
    }

    export function isValidBranchName(name: string): boolean {
        // Interdits: contrôle ASCII, espace, ~, ^, :, ?, *, [, \, séquence @{, backslash
        if (/[\u0000-\u001F\u007F\s~^:?*\[\\]/.test(name)) return false;
        if (name.includes('@{')) return false;
        if (name.startsWith('/') || name.endsWith('/')) return false;
        if (name.includes('//')) return false;
        if (name.endsWith('.')) return false;
        if (name.includes('..')) return false;
        if (name === '@') return false;
        return true;
    }
}
export default GithubBranchUtils;
