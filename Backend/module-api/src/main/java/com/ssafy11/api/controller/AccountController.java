package com.ssafy11.api.controller;

import com.ssafy11.api.service.AccountService;
import com.ssafy11.domain.Account.Account;
import com.ssafy11.domain.Account.BankCode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class AccountController {

    private final AccountService accountService;

    // 1. 계좌 만들기
    @PostMapping("/{user_id}/account")
    public ResponseEntity<Account> createAccount(
            @PathVariable("user_id") Integer userId,
            @RequestBody BankCode bankCode) {
        Account createdAccount = accountService.createAccount(userId, bankCode);
        return ResponseEntity.ok(createdAccount);
    }

    // 2. 내 계좌 등록하기
    @PostMapping("/users/{user_id}/account")
    public ResponseEntity<Account> registerAccount(
            @PathVariable("user_id") Integer userId,
            @RequestBody String accountNumber) {
        Account registeredAccount = accountService.connectAccount(userId, accountNumber);
        return ResponseEntity.ok(registeredAccount);
    }

    // 3. 내 계좌 보기 (은행 필터 추가)
    @GetMapping("/users/{user_id}/account")
    public ResponseEntity<List<Account>> viewAccounts(
            @PathVariable("user_id") Integer userId,
            @RequestParam(value = "bankCode", required = false) BankCode bankCode) {
        List<Account> accounts = accountService.findAllAccounts(userId, bankCode);
        return ResponseEntity.ok(accounts);
    }


    // 4. 연결 계좌 정보 보기
    @GetMapping("/users/{user_id}/account/info")
    public ResponseEntity<Account> viewConnectedAccountInfo(
            @PathVariable("user_id") Integer userId) {
        Account connectedAccount = accountService.connectedAccount(userId);
        return ResponseEntity.ok(connectedAccount);
    }
}
