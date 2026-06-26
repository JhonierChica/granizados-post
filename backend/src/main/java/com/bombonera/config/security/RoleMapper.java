package com.bombonera.config.security;

/**
 * Maps Spanish DB profile names to Spring Security role constants.
 * <p>
 * The database stores roles in Spanish (ADMINISTRADOR, MESERO, CAJERO)
 * and this mapper converts them to ROLE_ADMIN, ROLE_WAITER, ROLE_CASHIER.
 * Also handles the legacy English names (ADMIN, WAITER, CASHIER) for
 * backward compatibility during migration.
 */
public final class RoleMapper {

    private RoleMapper() {
        // utility class
    }

    /**
     * Converts a profile name (from DB) to a Spring Security GrantedAuthority role string.
     *
     * @param profileName the profile name from the database (e.g. "ADMINISTRADOR", "MESERO")
     * @return Spring Security role string (e.g. "ROLE_ADMIN", "ROLE_WAITER")
     */
    public static String toSpringRole(String profileName) {
        if (profileName == null || profileName.isBlank()) {
            return "ROLE_WAITER";
        }

        return switch (profileName.trim().toUpperCase()) {
            case "ADMINISTRADOR", "ADMIN" -> "ROLE_ADMIN";
            case "MESERO", "WAITER" -> "ROLE_WAITER";
            case "CAJERO", "CASHIER" -> "ROLE_CASHIER";
            default -> "ROLE_" + profileName.trim().toUpperCase().replace(" ", "_");
        };
    }
}
