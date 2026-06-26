package com.bombonera.modules.cashregister.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class CashRegisterScheduler {

    private final CashRegisterCloseService cashRegisterCloseService;

    public CashRegisterScheduler(CashRegisterCloseService cashRegisterCloseService) {
        this.cashRegisterCloseService = cashRegisterCloseService;
    }

    /**
     * Cierre de caja automático todos los días a las 23:59.
     * Si ya se realizó un cierre manual durante el día, se omite.
     */
    @Scheduled(cron = "0 59 23 * * *")
    public void autoDailyCashClose() {
        try {
            cashRegisterCloseService.createDailyCashClose("Sistema (Automático)");
            System.out.println("[CashRegisterScheduler] Cierre de caja automático realizado exitosamente.");
        } catch (RuntimeException e) {
            // Si ya existe un cierre para hoy (hecho manualmente), simplemente se omite
            System.out.println("[CashRegisterScheduler] Cierre automático omitido: " + e.getMessage());
        }
    }
}
