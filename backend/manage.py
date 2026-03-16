#!/usr/bin/env python
import os
import sys
import copy

# Python 3.14 compatibility patch for Django
def patch_django_314():
    try:
        from django.template import context
        def patched_copy(self):
            # In Python 3.14, copy.copy(super()) fails with AttributeError
            # because super() doesn't support setting attributes.
            # We bypass super() by copying the dict directly.
            duplicate = self.__class__.__new__(self.__class__)
            duplicate.dicts = self.dicts[:]
            return duplicate
        context.BaseContext.__copy__ = patched_copy
        print("Python 3.14 Django patch applied.")
    except ImportError:
        pass

def main():
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
    patch_django_314()
    from django.core.management import execute_from_command_line
    execute_from_command_line(sys.argv)

if __name__ == "__main__":
    main()
