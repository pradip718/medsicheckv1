/*
 *              Copyright (c) 2016-2019, Nuralogix Corp.
 *                      All Rights reserved
 *
 *      THIS SOFTWARE IS LICENSED BY AND IS THE CONFIDENTIAL AND
 *      PROPRIETARY PROPERTY OF NURALOGIX CORP. IT IS
 *      PROTECTED UNDER THE COPYRIGHT LAWS OF THE USA, CANADA
 *      AND OTHER FOREIGN COUNTRIES. THIS SOFTWARE OR ANY
 *      PART THEREOF, SHALL NOT, WITHOUT THE PRIOR WRITTEN CONSENT
 *      OF NURALOGIX CORP, BE USED, COPIED, DISCLOSED,
 *      DECOMPILED, DISASSEMBLED, MODIFIED OR OTHERWISE TRANSFERRED
 *      EXCEPT IN ACCORDANCE WITH THE TERMS AND CONDITIONS OF A
 *      NURALOGIX CORP SOFTWARE LICENSE AGREEMENT.
 */
#pragma once
#ifndef LIBDFX_ERRORS_H
#define LIBDFX_ERRORS_H

#include "dfxc/dfx_error.h"
#include <stdexcept>

/**
 * These are helpers for translating to/from the opaque dfx_error** types
 * and follow a standard pattern to raise the exception after transversing
 * the C-ABI layer.
 *
 * \see "Hourglass Interfaces for C++ APIs"
 */
namespace dfx {

/**
 * \struct Error DFXErrors.h "dfx/DFXErrors.h"
 */
struct Error {
    Error()
    : opaque(nullptr)
    {
    }

    ~Error()
    {
        if (opaque) {
            dfx_error_destroy(opaque);
        }
    }

    dfx_error* opaque;
};

/**
 * \class ThrowOnError DFXErrors.h "dfx/DFXErrors.h"
 */
class ThrowOnError {
public:
    ~ThrowOnError() noexcept(false)
    {
        if (_error.opaque) {
            throw std::runtime_error(dfx_error_message(_error.opaque));
        }
    }

    operator dfx_error**() { return &_error.opaque; }

private:
    struct Error _error;
};

#ifdef DFX_DEBUG_DESKTOP
#include <iostream>
class LogOnError {
public:
    LogOnError(std::ostream& os) : _os(os) {}
    ~LogOnError()
    {
        if (_error.opaque) {
            _os << _error.opaque << std::endl;
        }
    }

    operator dfx_error**() { return &_error.opaque; }

private:
    std::ostream& _os;
    struct Error _error;
};
#endif

} // namespace dfx

#endif