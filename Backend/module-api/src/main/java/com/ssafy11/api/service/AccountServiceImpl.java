package com.ssafy11.api.service;

import com.ssafy11.api.dto.account.VerifyNumber;
import com.ssafy11.api.dto.pay.PayHistoryDTO;
import com.ssafy11.api.exception.ErrorCode;
import com.ssafy11.api.exception.ErrorException;
import com.ssafy11.domain.Account.Account;
import com.ssafy11.domain.Account.AccountDao;
import com.ssafy11.domain.Account.PaginatedHistory;
import com.ssafy11.domain.Pay.PayHistory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AccountServiceImpl implements AccountService {
    private final AccountDao accountDao;

    @Override
    @Transactional
    public Account createAccount(Integer userId, String bankCode) {
        return accountDao.createAccount(userId, bankCode);
    }

    @Override
    @Transactional
    public Account connectAccount(Integer userId, String bankCode, String accountNumber) {
        Account account = accountDao.connectAccount(userId, bankCode, accountNumber);

        if (account == null) {
            throw new ErrorException(ErrorCode.ACCOUNT_NOT_FOUND);
        }

        return account;
    }

    @Override
    public List<Account> findAllAccounts(Integer userId, String bankCode) {
        return accountDao.findAllAccounts(userId, bankCode);
    }

    @Override
    public Account connectedAccount(Integer userId) {
        return accountDao.connectedAccount(userId);
    }

    @Override
    public Account findByAccountNumber(String accountNumber) {
        return accountDao.findByAccountNumber(accountNumber);
    }

    @Override
    public Account findByAccountId(Integer accountId) {
        return accountDao.findByAccountId(accountId);
    }

    @Override
    @Transactional
    public PayHistoryDTO chargeBalance(String accountNumber, Long amount) {
        PayHistory payHistory = accountDao.chargeBalance(accountNumber, amount);

        // PayHistory 엔티티를 PayHistoryDTO로 변환
        return new PayHistoryDTO(
                payHistory.amount(),
                payHistory.balanceAfterTransaction(),
                payHistory.transactionType(),
                payHistory.counterpartyName(),
                payHistory.counterpartyAccountNumber(),
                payHistory.description(),
                payHistory.transactionDate()
        );
    }


    @Override
    @Transactional
    public PayHistoryDTO sendMoney(String senderAccountNumber, String info, String targetAccountNumber, Long amount) {
        PayHistory payHistory = accountDao.sendMoney(senderAccountNumber, info, targetAccountNumber, amount);
        return convertToDTO(payHistory);
    }

    @Override
    public PaginatedHistory<PayHistoryDTO> findPayHistory(String accountNumber, LocalDate startDate, LocalDate endDate, String payType, int page, int size) {
        // DAO에서 페이 히스토리를 조회 (PayHistory 타입의 PaginatedHistory 반환)
        PaginatedHistory<PayHistory> paginatedHistory = accountDao.findPayHistory(accountNumber, startDate, endDate, payType, page, size);

        // PayHistory 데이터를 PayHistoryDTO로 변환
        List<PayHistoryDTO> payHistoryDTOList = paginatedHistory.data().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        // PayHistoryDTO 타입의 PaginatedHistory 반환
        return new PaginatedHistory<>(payHistoryDTOList, page, paginatedHistory.totalItemsCount(), paginatedHistory.totalPages());
    }




    // PayHistory 엔티티를 PayHistoryDTO로 변환하는 메서드
    private PayHistoryDTO convertToDTO(PayHistory payHistory) {
        return new PayHistoryDTO(
                payHistory.amount(),
                payHistory.balanceAfterTransaction(),
                payHistory.transactionType(),
                payHistory.counterpartyName(),
                payHistory.counterpartyAccountNumber(),
                payHistory.description(),
                payHistory.transactionDate()
        );
    }

    @Override
    @Transactional
    public VerifyNumber verifyMyAccount(Integer userId, String bankCode, String accountNumber) {
        String result = accountDao.verifyMyAccount(userId, bankCode, accountNumber);

        if (result == null) {
            throw new ErrorException(ErrorCode.ACCOUNT_NOT_FOUND);
        } else if (result.equals("유저 불일치")) {
            throw new ErrorException(ErrorCode.USER_MISSMATCH);
        }

        return new VerifyNumber(result);
    }
}